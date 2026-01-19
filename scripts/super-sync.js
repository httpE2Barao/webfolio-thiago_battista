const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');

const prisma = new PrismaClient();
cloudinary.config({
    cloud_name: 'dx9whz8ee',
    api_key: '312522471214743',
    api_secret: 'YJxlVBzx6G8uUKlXaK8feJ2OCRY',
});

async function superSync() {
    console.log('--- INICIANDO SUPER SINCRONIZAÇÃO ---');

    // 1. Listar todas as pastas de álbuns no Cloudinary
    const folderResult = await cloudinary.api.sub_folders('albums');
    const cloudFolders = folderResult.folders.map(f => f.name);
    console.log('Pastas encontradas no Cloudinary:', cloudFolders);

    for (const folderName of cloudFolders) {
        console.log(`\nSincronizando Álbum: ${folderName}`);

        // Buscar álbum correspondente no DB
        let album = await prisma.album.findFirst({
            where: { titulo: { equals: folderName, mode: 'insensitive' } }
        });

        if (!album) {
            console.log(`  (!) Álbum não encontrado no DB. Criando...`);
            album = await prisma.album.create({
                data: {
                    titulo: folderName,
                    categoria: 'Geral',
                    published: true
                }
            });
        }

        // Listar recursos reais nesta pasta
        const resources = [];
        let next_cursor = null;
        do {
            const result = await cloudinary.api.resources({
                type: 'upload',
                prefix: `albums/${folderName}/`,
                max_results: 500,
                next_cursor
            });
            resources.push(...result.resources);
            next_cursor = result.next_cursor;
        } while (next_cursor);

        console.log(`  Encontradas ${resources.length} fotos no Cloudinary.`);

        // Limpar imagens atuais do álbum no DB (reset para garantir sincronia)
        await prisma.image.deleteMany({ where: { albumId: album.id } });

        // Inserir as imagens reais
        const imageData = resources.map((r, index) => ({
            id: r.public_id.replace(/\//g, '-'), // ID único garantido
            filename: r.public_id.split('/').pop() + '.' + r.format,
            path: r.secure_url,
            albumId: album.id,
            ordem: index,
            altText: `${album.titulo} - Foto ${index + 1}`,
            metadata: {
                width: r.width,
                height: r.height,
                format: r.format,
                bytes: r.bytes
            }
        }));

        await prisma.image.createMany({ data: imageData });
        console.log(`  ${imageData.length} imagens sincronizadas.`);

        // Atualizar cover do álbum
        if (imageData.length > 0) {
            await prisma.album.update({
                where: { id: album.id },
                data: { coverImage: imageData[0].path, published: true }
            });
        }
    }

    // 4. Desativar álbuns que não existem no Cloudinary
    const allAlbuns = await prisma.album.findMany({ include: { _count: { select: { Image: true } } } });
    for (const a of allAlbuns) {
        if (a._count.Image === 0 && a.published) {
            console.log(`Desativando álbum vazio: ${a.titulo}`);
            await prisma.album.update({ where: { id: a.id }, data: { published: false } });
        }
    }

    console.log('\n--- SUPER SINCRONIZAÇÃO CONCLUÍDA ---');
}

superSync().catch(console.error).finally(() => prisma.$disconnect());
