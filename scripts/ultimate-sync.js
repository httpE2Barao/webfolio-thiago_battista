const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');

const prisma = new PrismaClient();
cloudinary.config({
    cloud_name: 'dx9whz8ee',
    api_key: '312522471214743',
    api_secret: 'YJxlVBzx6G8uUKlXaK8feJ2OCRY',
});

async function ultimateSync() {
    console.log('--- INICIANDO SINCRONIZAÇÃO ULTIMATE ---');

    // 1. Pegar TODOS os recursos da conta
    const allResources = [];
    let next_cursor = null;
    do {
        const result = await cloudinary.api.resources({
            type: 'upload',
            max_results: 500,
            next_cursor
        });
        allResources.push(...result.resources);
        next_cursor = result.next_cursor;
    } while (next_cursor);

    console.log(`Encontrados ${allResources.length} recursos no Cloudinary.`);

    // 2. Mapear recursos para álbuns com base no caminho da pasta
    const albumsMap = {}; // { albumTitle: [resources] }

    allResources.forEach(r => {
        if (r.public_id.startsWith('albums/')) {
            const parts = r.public_id.split('/');
            const albumTitle = parts[1]; // A pasta do álbum
            if (!albumsMap[albumTitle]) albumsMap[albumTitle] = [];
            albumsMap[albumTitle].push(r);
        }
    });

    console.log('Álbuns identificados nas pastas:', Object.keys(albumsMap));

    for (const albumTitle in albumsMap) {
        console.log(`\nSincronizando: ${albumTitle} (${albumsMap[albumTitle].length} fotos)`);

        // Tenta encontrar o melhor álbum no DB (ignora mas/mais, etc)
        let album = await prisma.album.findFirst({
            where: { titulo: { equals: albumTitle, mode: 'insensitive' } }
        });

        if (!album) {
            album = await prisma.album.create({
                data: { titulo: albumTitle, categoria: 'Geral', published: true }
            });
            console.log(`  Criado álbum novo no DB.`);
        }

        // Limpar e reinserir imagens
        await prisma.image.deleteMany({ where: { albumId: album.id } });

        const imageData = albumsMap[albumTitle].map((r, index) => ({
            id: r.public_id.replace(/\//g, '-'),
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

        // Atualizar capa
        await prisma.album.update({
            where: { id: album.id },
            data: {
                coverImage: imageData[0].path,
                published: true,
                isPrivate: false
            }
        });
    }

    // 3. Desativar álbuns que não estão no Cloudinary
    const currentTitles = Object.keys(albumsMap).map(t => t.toLowerCase());
    const dbAlbuns = await prisma.album.findMany();
    for (const a of dbAlbuns) {
        if (!currentTitles.includes(a.titulo.toLowerCase()) && a.published) {
            console.log(`Desativando álbum não encontrado: ${a.titulo}`);
            await prisma.album.update({ where: { id: a.id }, data: { published: false } });
        }
    }

    console.log('--- ULTIMATE SYNC FINALIZADO ---');
}

ultimateSync().catch(console.error).finally(() => prisma.$disconnect());
