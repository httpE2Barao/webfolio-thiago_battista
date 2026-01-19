const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCovers() {
    console.log('--- Corrigindo Capas de Álbuns v2 ---');

    const albuns = await prisma.album.findMany({
        where: { published: true },
        include: {
            Image: {
                orderBy: { ordem: 'asc' },
                take: 1
            }
        }
    });

    for (const album of albuns) {
        console.log(`Verificando Álbum [${album.id}]: ${album.titulo}`);
        if (album.Image.length > 0) {
            const newCover = album.Image[0].path;
            await prisma.album.update({
                where: { id: album.id },
                data: { coverImage: newCover }
            });
            console.log(`  -> Capa definida para: ${newCover}`);
        } else {
            console.log('  -> Sem imagens encontradas.');
        }
    }
}

fixCovers().catch(console.error).finally(() => prisma.$disconnect());
