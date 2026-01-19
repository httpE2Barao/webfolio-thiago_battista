const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: 'dx9whz8ee',
    api_key: '312522471214743',
    api_secret: 'YJxlVBzx6G8uUKlXaK8feJ2OCRY',
});

async function listFolders() {
    console.log('--- Pastas no Cloudinary ---');
    try {
        const result = await cloudinary.api.root_folders();
        console.log(result.folders.map(f => f.name));

        for (const folder of result.folders) {
            const sub = await cloudinary.api.sub_folders(folder.name);
            console.log(`Subpastas de ${folder.name}:`, sub.folders.map(f => f.name));
        }

        console.log('\n--- Amostra de Arquivos ---');
        const resources = await cloudinary.api.resources({ max_results: 10 });
        resources.resources.forEach(r => {
            console.log(`- ${r.public_id} (${r.secure_url})`);
        });
    } catch (error) {
        console.error(error);
    }
}

listFolders();
