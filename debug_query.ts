
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const albums = await prisma.album.findMany({
        where: {
            titulo: {
                contains: 'Topview',
                mode: 'insensitive'
            }
        },
        select: {
            id: true,
            titulo: true
        }
    });
    console.log(JSON.stringify(albums, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
