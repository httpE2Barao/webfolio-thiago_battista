const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const cats = await prisma.category.findMany();
    console.log('Categories count:', cats.length);
    console.log('Categories names:', cats.map(c => c.name));
}

main().catch(console.error).finally(() => prisma.$disconnect());
