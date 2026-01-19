const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deepCleanup() {
    console.log('--- LIMPANDO E CORRIGINDO TUDO ---');

    // 1. Corrigir o erro 'Ordiaria' vs 'Ordinaria' e outros erros de digitação
    const images = await prisma.image.findMany();
    console.log(`Verificando ${images.length} imagens...`);

    for (const img of images) {
        let newPath = img.path;
        let modified = false;

        // Erros de digitação comuns encontrados nos logs/inspeção
        if (newPath.includes('Ordiaria')) {
            newPath = newPath.replace('Ordiaria', 'Ordinaria');
            modified = true;
        }

        // Remover extensões duplicadas
        if (newPath.includes('.jpgpg')) {
            newPath = newPath.replace(/\.jpgpg/g, '.jpg');
            modified = true;
        }
        if (newPath.includes('.avifpg')) {
            newPath = newPath.replace(/\.avifpg/g, '.avif');
            modified = true;
        }

        // Corrigir prefixos 0 fantasmagóricos se virmos 404s recorrentes
        // Mas vamos primeiro focar nos erros confirmados.

        if (modified) {
            await prisma.image.update({
                where: { id: img.id },
                data: { path: newPath }
            });
        }
    }

    // 2. Corrigir capas dos álbuns
    const albuns = await prisma.album.findMany({
        include: { Image: { orderBy: { ordem: 'asc' }, take: 1 } }
    });

    for (const album of albuns) {
        let cover = album.coverImage || '';
        if (cover.includes('Ordiaria')) {
            cover = cover.replace('Ordiaria', 'Ordinaria');
            await prisma.album.update({ where: { id: album.id }, data: { coverImage: cover } });
        }

        // Se a capa ainda for file.jpg, troca pela primeira foto REAL
        if (cover.includes('file.jpg') && album.Image.length > 0) {
            await prisma.album.update({ where: { id: album.id }, data: { coverImage: album.Image[0].path } });
        }
    }

    // 3. Deletar álbuns sem imagens que são duplicatas
    const duplicates = await prisma.album.findMany({
        where: {
            OR: [
                { id: 'Bonitinha Mais Ordinaria' },
                { id: 'Sambas de Axé' },
                { id: 'Agora é que são elas' },
                { id: 'Samba do meu rap' },
                { id: 'Emicida' },
                { id: 'Risorama' }
            ]
        }
    });

    for (const dup of duplicates) {
        await prisma.album.delete({ where: { id: dup.id } });
        console.log(`Deletada duplicata: ${dup.id}`);
    }

    console.log('Limpeza profunda concluída.');
}

deepCleanup().catch(console.error).finally(() => prisma.$disconnect());
