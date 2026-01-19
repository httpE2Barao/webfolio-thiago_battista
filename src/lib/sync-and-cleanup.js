const cloudinary = require('cloudinary').v2;
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function runSync() {
    console.log("=== INICIANDO SINCRONIZAÇÃO E LIMPEZA ===");

    try {
        // 1. Listar TODOS os recursos na pasta albums/
        let allResources = [];
        let nextCursor = null;

        do {
            const result = await cloudinary.api.resources({
                type: 'upload',
                prefix: 'albums/',
                max_results: 500,
                next_cursor: nextCursor
            });
            allResources = allResources.concat(result.resources);
            nextCursor = result.next_cursor;
        } while (nextCursor);

        console.log(`Total de recursos encontrados no Cloudinary: ${allResources.length}`);

        // 2. Separar originais (randomizados) de duplicatas (meus uploads recentes)
        // Assumimos que duplicatas têm display_name começando com DSCF ou 0DSCF ou similar ao filename original
        const duplicates = allResources.filter(r => {
            const name = r.display_name;
            // Se o nome parece um filename original (ex: DSCF1234), é duplicata
            return /^(0?DSCF|IMG_|P_|foto_|file)/i.test(name) || r.public_id.includes(name);
        });

        const randomized = allResources.filter(r => !duplicates.find(d => d.public_id === r.public_id));

        console.log(`Duplicatas detectadas: ${duplicates.length}`);
        console.log(`Originais (randomizados) detectados: ${randomized.length}`);

        // 3. Agrupar originais por pasta (Álbum)
        const randomizedByFolder = {};
        randomized.forEach(r => {
            const parts = r.public_id.split('/');
            if (parts.length >= 3) {
                const folder = parts[1]; // albums/[FOLDER]/...
                if (!randomizedByFolder[folder]) randomizedByFolder[folder] = [];
                randomizedByFolder[folder].push(r);
            }
        });

        // 4. Sincronizar Banco de Dados
        for (const folderName in randomizedByFolder) {
            console.log(`\nSincronizando Álbum: ${folderName}`);

            // Localiza o álbum no banco
            let album = await prisma.album.findFirst({
                where: {
                    OR: [
                        { id: folderName },
                        { titulo: { equals: folderName.replace(/-/g, ' '), mode: 'insensitive' } }
                    ]
                }
            });

            if (!album) {
                console.log(`  Álbum não encontrado no banco: ${folderName}. Ignorando.`);
                continue;
            }

            const assets = randomizedByFolder[folderName];

            // Para cada asset randomizado, vamos atualizar ou criar no banco
            // Como não sabemos a ordem exata original, vamos apenas garantir que eles existam
            // Se o banco tiver registros locais (/images/...), vamos atualizar os caminhos

            const dbImages = await prisma.image.findMany({
                where: { albumId: album.id },
                orderBy: { ordem: 'asc' }
            });

            for (let i = 0; i < assets.length; i++) {
                const asset = assets[i];

                // Se temos um registro no banco na mesma posição (safest choice if order matters)
                if (dbImages[i]) {
                    await prisma.image.update({
                        where: { id: dbImages[i].id },
                        data: {
                            path: asset.secure_url,
                            updatedAt: new Date()
                        }
                    });
                    console.log(`  Atualizado: ${dbImages[i].filename} -> ${asset.secure_url}`);
                } else {
                    // Senão cria novo record
                    await prisma.image.create({
                        data: {
                            id: asset.public_id,
                            filename: `foto-${i}.jpg`,
                            path: asset.secure_url,
                            albumId: album.id,
                            ordem: i,
                            metadata: { width: asset.width, height: asset.height }
                        }
                    });
                    console.log(`  Criado novo registro para: ${asset.public_id}`);
                }
            }
        }

        // 5. Limpeza de Duplicatas no Cloudinary (OPCIONAL - vamos apenas listar por segurança primeiro)
        console.log(`\n--- PRONTO PARA LIMPAR ---`);
        console.log(`Poderia deletar ${duplicates.length} duplicatas.`);
        /*
        for (const dup of duplicates) {
            console.log(`Deletando duplicata: ${dup.public_id}`);
            await cloudinary.uploader.destroy(dup.public_id);
        }
        */

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

runSync();
