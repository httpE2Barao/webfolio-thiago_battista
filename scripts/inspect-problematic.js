const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
    const titles = ['Bonitinha Mais Ordinaria', 'Sambas de Axé', 'Agora é que são elas'];

    for (const title of titles) {
        console.log(`\n=== Inspecionando: ${title} ===`);
        const albuns = await prisma.album.findMany({
            where: { titulo: { contains: title, mode: 'insensitive' } },
            include: { _count: { select: { Image: true } } }
        });

        albuns.forEach(a => {
            console.log(`ID: ${a.id} | Published: ${a.published} | Imagens: ${a._count.Image}`);
            console.log(`Cover: ${a.coverImage}`);
        });

        const albumIds = albuns.map(a => a.id);
        const images = await prisma.image.findMany({
            where: { albumId: { in: albumIds } },
            take: 2
        });
        console.log('Amostra de Imagens:');
        images.forEach(img => console.log(` - ID: ${img.id} | Path: ${img.path}`));
    }
}

inspect().catch(console.error).finally(() => prisma.$disconnect());
