const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reactivate() {
    console.log('--- REATIVANDO ÁLBUNS E FIXANDO CAPAS ---');

    // 1. Reativar todos os álbuns que têm imagens
    const result = await prisma.album.updateMany({
        where: {
            Image: { some: {} }
        },
        data: {
            published: true,
            isPrivate: false
        }
    });
    console.log(`${result.count} álbuns reativados.`);

    // 2. Garantir que as capas sejam válidas (não file.jpg ou vazias)
    const albuns = await prisma.album.findMany({
        include: { Image: { orderBy: { ordem: 'asc' }, take: 1 } }
    });

    for (const a of albuns) {
        if (a.Image.length > 0) {
            if (!a.coverImage || a.coverImage.includes('file.jpg') || a.coverImage === '/placeholder.jpg') {
                console.log(`  Atualizando capa de: ${a.titulo}`);
                await prisma.album.update({
                    where: { id: a.id },
                    data: { coverImage: a.Image[0].path }
                });
            }
        }
    }

    console.log('--- PRONTO ---');
}

reactivate().catch(console.error).finally(() => prisma.$disconnect());
