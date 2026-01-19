const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('--- Resumo do Banco de Dados ---');
    const albumCount = await prisma.album.count();
    const imageCount = await prisma.image.count();
    console.log(`Álbuns totais: ${albumCount}`);
    console.log(`Imagens totais: ${imageCount}`);

    const publishedAlbuns = await prisma.album.findMany({
        where: { published: true },
        select: { id: true, titulo: true, isPrivate: true, _count: { select: { Image: true } } }
    });

    console.log('\n--- Álbuns Publicados ---');
    publishedAlbuns.forEach(a => {
        console.log(`- ${a.titulo} (ID: ${a.id}): ${a._count.Image} fotos, Privado: ${a.isPrivate}`);
    });

    const sampleImages = await prisma.image.findMany({
        take: 5,
        select: { id: true, path: true, albumId: true }
    });

    console.log('\n--- Amostra de Imagens (URLs) ---');
    sampleImages.forEach(img => {
        console.log(`- Foto ID: ${img.id} | Álbum: ${img.albumId}`);
        console.log(`  Path: ${img.path}`);
    });

    console.log('\n--- Pastas Únicas no Banco ---');
    const allPaths = await prisma.image.findMany({ select: { path: true } });
    const folders = new Set();
    allPaths.forEach(img => {
        if (img.path.includes('/upload/')) {
            const parts = img.path.split('/upload/')[1].split('/');
            // Part 0 is version (usually v...) or first folder
            if (parts[0].startsWith('v')) {
                folders.add(parts[1]);
            } else {
                folders.add(parts[0]);
            }
        }
    });
    console.log(Array.from(folders));
}

check().catch(console.error).finally(() => prisma.$disconnect());
