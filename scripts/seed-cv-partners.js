const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const sections = [
        {
            title: "Parceiros e Patrocinadores",
            content: "• Ministério da Cultura\n• Peróxidos do Brasil\n• Sanepar\n• Cinemark\n• Gustavo",
            category: "general",
            sidebar: true,
            ordem: 10
        }
    ];

    console.log("Adding Parcerias section...");
    for (const section of sections) {
        await prisma.cVSection.create({ data: section });
    }

    console.log("Done!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
