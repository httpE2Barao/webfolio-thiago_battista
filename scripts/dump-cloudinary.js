const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: 'dx9whz8ee',
    api_key: '312522471214743',
    api_secret: 'YJxlVBzx6G8uUKlXaK8feJ2OCRY',
});

async function dumpAll() {
    console.log('--- DUMP TOTAL CLOUDINARY ---');
    let next_cursor = null;
    let total = 0;
    const allResources = [];

    try {
        do {
            const result = await cloudinary.api.resources({
                type: 'upload',
                max_results: 500,
                next_cursor
            });
            allResources.push(...result.resources);
            total += result.resources.length;
            next_cursor = result.next_cursor;
            console.log(`Carregados ${total}...`);
        } while (next_cursor);

        console.log(`Total final: ${total}`);

        // Agrupar por pasta para ver o que temos
        const folderStats = {};
        allResources.forEach(r => {
            const folder = r.public_id.includes('/') ? r.public_id.split('/').slice(0, -1).join('/') : 'ROOT';
            folderStats[folder] = (folderStats[folder] || 0) + 1;
        });

        console.log('\n--- Estatísticas de Pastas ---');
        console.log(folderStats);

        // Salvar amostra de cada pasta
        for (const folder in folderStats) {
            const sample = allResources.find(r => r.public_id.startsWith(folder + '/'));
            if (sample) console.log(`Sample [${folder}]: ${sample.public_id}`);
        }
    } catch (e) {
        console.error(e.message);
    }
}

dumpAll();
