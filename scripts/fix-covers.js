const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCovers() {
    console.log('--- Corrigindo Capas de Álbuns (Placeholders -> Reais) ---');

    const albuns = await prisma.album.findMany({
        include: {
            Image: {
                orderBy: { ordem: 'asc' },
                take: 1
            }
        }
    });

    for (const album of albuns) {
        const hasInvalidCover = !album.coverImage || album.coverImage.includes('file.jpg') || album.coverImage === '/placeholder.jpg';

        if (hasInvalidCover && album.Image.length > 0) {
            const newCover = album.Image[0].path;
            await prisma.album.update({
                where: { id: album.id },
                data: { coverImage: newCover }
            });
            console.log(`- Álbum ${album.titulo}: Capa atualizada para ${newCover}`);
        } else if (hasInvalidCover) {
            console.log(`- Álbum ${album.titulo}: Sem imagens para definir capa.`);
        }
    }
}

fixCovers().catch(console.error).finally(() => prisma.$disconnect());
