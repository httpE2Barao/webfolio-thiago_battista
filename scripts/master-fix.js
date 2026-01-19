const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function masterFix() {
    console.log('--- RESTAURAÇÃO TOTAL DO BANCO DE DADOS ---');

    // 1. Restaurar visibilidade dos álbuns principais
    const titlesToFix = ['Bonitinha Mais Ordinaria', 'Sambas de Axé', 'Agora é que são elas', 'Emicida', 'Duelo Amazônico', 'Cest Cher', 'Risorama', 'Samba do meu rap'];

    for (const title of titlesToFix) {
        console.log(`\nProcessando: ${title}`);
        const albuns = await prisma.album.findMany({
            where: { titulo: { equals: title, mode: 'insensitive' } },
            include: { _count: { select: { Image: true } } }
        });

        if (albuns.length === 0) {
            console.log('  (!) Nenhum álbum encontrado com esse título.');
            continue;
        }

        // Encontrar o que tem mais imagens
        const bestAlbum = albuns.reduce((prev, current) => (prev._count.Image > current._count.Image) ? prev : current);

        console.log(`  Mantendo ID: ${bestAlbum.id} com ${bestAlbum._count.Image} imagens.`);

        // Ativar o melhor
        await prisma.album.update({
            where: { id: bestAlbum.id },
            data: { published: true, isPrivate: false }
        });

        // Desativar os outros duplicados
        for (const a of albuns) {
            if (a.id !== bestAlbum.id) {
                await prisma.album.update({
                    where: { id: a.id },
                    data: { published: false }
                });
            }
        }
    }

    // 2. Corrigir strings corrompidas (.jpgpg, etc)
    const allImages = await prisma.image.findMany({
        where: {
            OR: [
                { path: { contains: '.jpgpg' } },
                { path: { contains: '.avifpg' } },
                { path: { contains: '/webfolio/' } }
            ]
        }
    });

    console.log(`\nCorrigindo ${allImages.length} imagens com URLs corrompidas...`);
    for (const img of allImages) {
        let newPath = img.path
            .replace(/\.jpgpg/g, '.jpg')
            .replace(/\.avifpg/g, '.avif')
            .replace(/\/webfolio\//g, '/albums/');

        await prisma.image.update({
            where: { id: img.id },
            data: { path: newPath }
        });
    }

    // 3. Corrigir capas (coverImage)
    const allAlbuns = await prisma.album.findMany({
        include: { Image: { orderBy: { ordem: 'asc' }, take: 1 } }
    });

    for (const album of allAlbuns) {
        let cover = album.coverImage || '';
        let needsUpdate = false;

        if (cover.includes('.jpgpg') || cover.includes('.avifpg') || cover.includes('/webfolio/') || cover === '') {
            cover = cover.replace(/\.jpgpg/g, '.jpg').replace(/\.avifpg/g, '.avif').replace(/\/webfolio\//g, '/albums/');
            needsUpdate = true;
        }

        // Se ainda estiver vazio ou inválido, usa a primeira imagem
        if ((!cover || cover.includes('file.jpg') || cover === '/placeholder.jpg') && album.Image.length > 0) {
            cover = album.Image[0].path;
            needsUpdate = true;
        }

        if (needsUpdate) {
            await prisma.album.update({
                where: { id: album.id },
                data: { coverImage: cover }
            });
        }
    }

    console.log('\n--- Sincronização Concluída ---');
}

masterFix().catch(console.error).finally(() => prisma.$disconnect());
