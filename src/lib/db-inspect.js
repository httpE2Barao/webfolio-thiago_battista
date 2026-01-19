const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        console.log("--- TABLES ---");
        const tables = await prisma.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log(JSON.stringify(tables, null, 2));

        const tableNames = tables.map(t => t.table_name);

        if (tableNames.includes('albums')) {
            console.log("\n--- LEGACY 'albums' TABLE SAMPLE ---");
            const legacyAlbums = await prisma.$queryRawUnsafe("SELECT * FROM albums LIMIT 1");
            console.log(JSON.stringify(legacyAlbums, null, 2));
        }

        console.log("\n--- PRISMA 'Album' COUNT ---");
        const albumCount = await prisma.album.count();
        console.log(`Count: ${albumCount}`);

        console.log("\n--- PRISMA 'Image' STATS ---");
        const localCount = await prisma.image.count({ where: { path: { startsWith: '/images/' } } });
        const remoteCount = await prisma.image.count({ where: { path: { startsWith: 'http' } } });
        console.log(`Local: ${localCount}, Remote: ${remoteCount}`);

        console.log("\n--- REMOTE SAMPLES ---");
        const samples = await prisma.image.findMany({
            where: { path: { startsWith: 'http' } },
            take: 3,
            select: { filename: true, path: true }
        });
        console.log(JSON.stringify(samples, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
