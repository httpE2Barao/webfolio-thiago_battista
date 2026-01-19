import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(filePath: string, albumFolder: string) {
    const fileNameWithExt = path.basename(filePath);
    const fileName = path.parse(fileNameWithExt).name;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                public_id: fileName,
                folder: `albums/${albumFolder}`,
                resource_type: 'auto',
                overwrite: false, // Don't re-upload if ID exists
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        fs.createReadStream(filePath).pipe(uploadStream);
    }) as Promise<any>;
}

async function migrate() {
    console.log('=== RETOMANDO SINCRONIZAÇÃO (RESTAM ~376) ===');

    const baseDir = path.join(process.cwd(), 'public/images');
    if (!fs.existsSync(baseDir)) {
        console.error('Diretório public/images não encontrado.');
        process.exit(1);
    }

    const albumFolders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

    for (const folder of albumFolders) {
        const albumPath = path.join(baseDir, folder);
        const files = fs.readdirSync(albumPath).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f));

        let album = await prisma.album.findFirst({
            where: {
                OR: [
                    { id: folder },
                    { titulo: { equals: folder.replace(/-/g, ' '), mode: 'insensitive' } }
                ]
            }
        });

        if (!album) continue;

        // Busca apenas fotos deste álbum que ainda têm path local
        const localImages = await prisma.image.findMany({
            where: {
                albumId: album.id,
                path: { startsWith: '/images/' }
            }
        });

        if (localImages.length === 0) continue;

        console.log(`\nÁlbum: ${folder} (${localImages.length} pendentes)`);

        for (const imgRecord of localImages) {
            const file = imgRecord.filename;
            const filePath = path.join(albumPath, file);

            if (!fs.existsSync(filePath)) {
                console.log(`  Arquivo não existe localmente: ${file}. Pulando.`);
                continue;
            }

            try {
                process.stdout.write(`  ${file}... `);
                const result = await uploadToCloudinary(filePath, folder);

                await prisma.image.update({
                    where: { id: imgRecord.id },
                    data: {
                        path: result.secure_url,
                        updatedAt: new Date()
                    }
                });
                console.log(`OK`);
            } catch (err: any) {
                console.log(`ERRO: ${err.message}`);
            }
        }
    }

    console.log('\n=== MIGRAÇÃO CONCLUÍDA ===');
    await prisma.$disconnect();
}

migrate();
