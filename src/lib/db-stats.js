const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const localImagesCount = await prisma.image.count({
        where: {
            path: {
                startsWith: '/images/'
            }
        }
    });
    const cloudinaryImagesCount = await prisma.image.count({
        where: {
            path: {
                startsWith: 'http'
            }
        }
    });
    console.log(`Local Images: ${localImagesCount}`);
    console.log(`Cloudinary Images: ${cloudinaryImagesCount}`);

    if (localImagesCount > 0) {
        const sample = await prisma.image.findFirst({
            where: { path: { startsWith: '/images/' } },
            select: { filename: true, albumId: true, path: true }
        });
        console.log("Sample Local:", sample);
    }
    await prisma.$disconnect();
}
check();
66