import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        const album = await prisma.album.findFirst({
            include: { Image: { take: 5 } }
        });
        console.log("Database Sample:");
        console.log(JSON.stringify(album, null, 2));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
