const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPaths() {
    console.log('--- Corrigindo caminhos no Banco de Dados ---');

    // 1. Corrigir Album.coverImage
    const albuns = await prisma.album.findMany({
        where: {
            OR: [
                { coverImage: { contains: '/webfolio/' } },
                { coverImage: { contains: '/albums/' } } // Apenas para garantir que estão em sync
            ]
        }
    });

    for (const album of albuns) {
        if (album.coverImage && album.coverImage.includes('/webfolio/')) {
            const newPath = album.coverImage.replace('/webfolio/', '/albums/');
            await prisma.album.update({
                where: { id: album.id },
                data: { coverImage: newPath }
            });
            console.log(`- Álbum ${album.titulo} corrigido.`);
        }
    }

    // 2. Corrigir Image.path
    const images = await prisma.image.findMany({
        where: { path: { contains: '/webfolio/' } }
    });
    console.log(`Corrigindo ${images.length} imagens...`);

    let count = 0;
    for (const image of images) {
        const newPath = image.path.replace('/webfolio/', '/albums/');
        await prisma.image.update({
            where: { id: image.id },
            data: { path: newPath }
        });
        count++;
    }
    console.log(`${count} imagens atualizadas.`);

    // 3. Remover álbuns duplicados (IDs que são strings de texto vs IDs cmfco...)
    // Vamos apenas desativar os que não tem 'cmfco' no ID se o título for duplicado
    const allAlbuns = await prisma.album.findMany();
    const titles = {};
    for (const album of allAlbuns) {
        if (!titles[album.titulo]) {
            titles[album.titulo] = [];
        }
        titles[album.titulo].push(album);
    }

    for (const title in titles) {
        if (titles[title].length > 1) {
            console.log(`- Duplicado encontrado: ${title}`);
            // Manter o que tem ID cmfco (mais provável ser o original)
            for (const album of titles[title]) {
                if (!album.id.startsWith('cm')) {
                    console.log(`  Desativando duplicata com ID: ${album.id}`);
                    await prisma.album.update({
                        where: { id: album.id },
                        data: { published: false }
                    });
                }
            }
        }
    }
}

fixPaths().catch(console.error).finally(() => prisma.$disconnect());
