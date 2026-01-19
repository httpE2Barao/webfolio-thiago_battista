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

const ALBUM_NAME = 'Agora é que são elas';
const LOCAL_DIR = path.join(process.cwd(), 'public', 'images', ALBUM_NAME);

async function forceUpload() {
    console.log(`--- FORÇANDO UPLOAD: ${ALBUM_NAME} ---`);

    if (!fs.existsSync(LOCAL_DIR)) {
        console.error(`Diretório não encontrado: ${LOCAL_DIR}`);
        return;
    }

    let album = await prisma.album.findFirst({
        where: { titulo: ALBUM_NAME }
    });

    if (!album) {
        album = await prisma.album.create({
            data: { titulo: ALBUM_NAME, categoria: 'teatro', published: true }
        });
    }

    const files = fs.readdirSync(LOCAL_DIR).filter(f =>
        ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(f).toLowerCase())
    );

    console.log(`Encontrados ${files.length} arquivos locais.`);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = path.parse(file).name;
        const filePath = path.join(LOCAL_DIR, file);

        try {
            console.log(`  Subindo ${file}...`);
            const result = await cloudinary.uploader.upload(filePath, {
                folder: `albums/${ALBUM_NAME}`,
                public_id: fileName,
                resource_type: 'auto',
                overwrite: true
            });

            const imageId = result.public_id.replace(/\//g, '-');

            // Upsert no banco
            await prisma.image.upsert({
                where: { id: imageId },
                update: {
                    path: result.secure_url,
                    albumId: album.id,
                    ordem: i,
                    filename: file
                },
                create: {
                    id: imageId,
                    filename: file,
                    path: result.secure_url,
                    albumId: album.id,
                    ordem: i,
                    altText: `${ALBUM_NAME} - ${fileName}`
                }
            });
            console.log(`    OK: ${result.secure_url}`);
        } catch (e) {
            console.error(`    ERRO em ${file}:`, e.message);
        }
    }

    // Marcar álbum como publicado
    await prisma.album.update({
        where: { id: album.id },
        data: { published: true, coverImage: (await prisma.image.findFirst({ where: { albumId: album.id }, orderBy: { ordem: 'asc' } }))?.path }
    });

    console.log('--- FINALIZADO ---');
}

forceUpload().catch(console.error).finally(() => prisma.$disconnect());
