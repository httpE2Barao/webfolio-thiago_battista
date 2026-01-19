import { createPool } from '@vercel/postgres';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar .env
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Configurar Cloudinary
const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
};

if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
    console.error("ERRO: Credenciais do Cloudinary ausentes no .env");
    process.exit(1);
}

cloudinary.config(cloudinaryConfig);

// Configurar Banco
const pool = createPool({
    connectionString: process.env.DATABASE_URL,
});

// Mapeamento simples de categorias (pode ajustar conforme seu config)
function getCategory(folderName: string) {
    // Exemplo simplificado. Idealmente importaria do config/categories.js se possível
    return 'outros';
}

async function uploadToCloudinary(filePath: string, folderName: string) {
    const fileName = path.parse(filePath).name;
    const publicId = `albums/${folderName}/${fileName}`;

    // Tenta primeiro encontrar se já existe
    try {
        const existing = await cloudinary.api.resource(publicId);
        if (existing) {
            console.log(`  Já existe: ${publicId}`);
            return existing;
        }
    } catch (e) {
        // Se der 404, prossegue para o upload
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: `albums/${folderName}`,
                resource_type: 'auto',
                use_filename: true,
                unique_filename: false,
                overwrite: false
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        ).end(fileBuffer);
    }) as Promise<any>;
}

async function migrate() {
    console.log('=== INICIANDO MIGRAÇÃO PARA CLOUDINARY ===');

    const baseDir = path.join(process.cwd(), 'public/images');
    if (!fs.existsSync(baseDir)) {
        console.error('Diretório public/images não encontrado.');
        process.exit(1);
    }

    const albums = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

    for (const albumFolder of albums) {
        console.log(`\nProcessando álbum: ${albumFolder}`);
        const albumPath = path.join(baseDir, albumFolder);
        const files = fs.readdirSync(albumPath).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));

        const uploadedImages = [];

        // 1. Upload das Imagens
        for (const file of files) {
            const filePath = path.join(albumPath, file);
            try {
                process.stdout.write(`  Upload ${file}... `);
                const result = await uploadToCloudinary(filePath, albumFolder);
                console.log(`OK (${result.secure_url})`);

                uploadedImages.push({
                    id: result.public_id,
                    filename: file,
                    path: result.secure_url,
                    width: result.width,
                    height: result.height,
                    bytes: result.bytes,
                    format: result.format
                });
            } catch (err: any) {
                console.log(`ERRO: ${err.message}`);
            }
        }

        if (uploadedImages.length > 0) {
            // 2. Atualizar Banco de Dados
            const albumId = albumFolder;
            const coverImage = uploadedImages[0].path;

            // Garante que o álbum existe (Upsert simplificado)
            // Nota: Ajuste os campos 'categoria' conforme necessário se for crítico
            await pool.sql`
            INSERT INTO "Album" ("id", "titulo", "categoria", "coverImage", "published", "isPrivate", "updatedAt")
            VALUES (${albumId}, ${albumFolder.replace(/-/g, ' ')}, 'Geral', ${coverImage}, true, false, NOW())
            ON CONFLICT ("id") DO UPDATE 
            SET "coverImage" = EXCLUDED."coverImage",
                "updatedAt" = NOW();
          `;

            // Insere as imagens na tabela Image
            for (let i = 0; i < uploadedImages.length; i++) {
                const img = uploadedImages[i];
                await pool.sql`
                INSERT INTO "Image" ("id", "filename", "path", "albumId", "ordem", "metadata", "updatedAt")
                VALUES (${img.id}, ${img.filename}, ${img.path}, ${albumId}, ${i}, ${JSON.stringify({
                    width: img.width,
                    height: img.height,
                    format: img.format,
                    bytes: img.bytes
                })}::jsonb, NOW())
                ON CONFLICT ("id") DO UPDATE 
                SET "path" = EXCLUDED."path",
                    "metadata" = EXCLUDED."metadata";
              `;
            }
            console.log(`  -> Banco de dados atualizado com ${uploadedImages.length} imagens.`);
        }
    }

    console.log('\n=== MIGRAÇÃO CONCLUÍDA ===');
    process.exit(0);
}

migrate();
