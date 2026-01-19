const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
cloudinary.config({
    cloud_name: 'dx9whz8ee',
    api_key: '312522471214743',
    api_secret: 'YJxlVBzx6G8uUKlXaK8feJ2OCRY',
});

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

async function migrate() {
    console.log('--- INICIANDO MIGRAÇÃO LOCAL -> CLOUDINARY ---');

    if (!fs.existsSync(PUBLIC_IMAGES_DIR)) {
        console.error('Diretório public/images não encontrado.');
        return;
    }

    const albums = fs.readdirSync(PUBLIC_IMAGES_DIR).filter(f =>
        fs.statSync(path.join(PUBLIC_IMAGES_DIR, f)).isDirectory()
    );

    console.log(`Encontrados ${albums.length} álbuns locais.`);

    for (const albumName of albums) {
        console.log(`\nProcessando Álbum: ${albumName}`);

        // 1. Garantir que o álbum existe no DB
        let album = await prisma.album.findFirst({
            where: { titulo: { equals: albumName, mode: 'insensitive' } }
        });

        if (!album) {
            album = await prisma.album.create({
                data: { titulo: albumName, categoria: 'Geral', published: true }
            });
            console.log(`  Criado álbum no DB.`);
        }

        const albumDir = path.join(PUBLIC_IMAGES_DIR, albumName);
        const files = fs.readdirSync(albumDir).filter(f =>
            ['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(path.extname(f).toLowerCase())
        );

        console.log(`  ${files.length} imagens locais encontradas.`);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = path.parse(file).name;
            const publicId = `albums/${albumName}/${fileName}`;

            // 2. Verificar se já existe no DB com link CLOUDINARY
            const existingImage = await prisma.image.findFirst({
                where: {
                    filename: file,
                    albumId: album.id
                }
            });

            if (existingImage && existingImage.path.includes('cloudinary.com')) {
                console.log(`  [PULAR] ${file} já está no Cloudinary.`);
                continue;
            }

            console.log(`  [UPLOAD] ${file}...`);
            try {
                const uploadResult = await cloudinary.uploader.upload(path.join(albumDir, file), {
                    folder: `albums/${albumName}`,
                    public_id: fileName,
                    overwrite: false // Evita sobrescrever se já existir no Cloudinary
                });

                // 3. Salvar no Prisma
                await prisma.image.create({
                    data: {
                        id: uploadResult.public_id.replace(/\//g, '-'),
                        filename: file,
                        path: uploadResult.secure_url,
                        albumId: album.id,
                        ordem: i + 100, // Ordem alta para não conflitar com existentes
                        altText: `${albumName} - ${fileName}`,
                        metadata: {
                            width: uploadResult.width,
                            height: uploadResult.height,
                            format: uploadResult.format,
                            bytes: uploadResult.bytes
                        }
                    }
                });
                console.log(`    OK.`);
            } catch (error) {
                console.error(`    ERRO ao processar ${file}:`, error.message);
            }
        }
    }

    console.log('\n--- MIGRAÇÃO CONCLUÍDA ---');
}

migrate().catch(console.error).finally(() => prisma.$disconnect());
