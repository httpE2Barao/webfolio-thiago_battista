const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const images = await prisma.image.findMany({
        take: 10,
        select: { id: true, path: true, filename: true, albumId: true }
    });
    console.log(JSON.stringify(images, null, 2));
    await prisma.$disconnect();
}
check();
