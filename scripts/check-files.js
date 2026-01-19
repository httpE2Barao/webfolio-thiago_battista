const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: 'dx9whz8ee',
    api_key: '312522471214743',
    api_secret: 'YJxlVBzx6G8uUKlXaK8feJ2OCRY',
});

async function checkCovers() {
    const folders = ['Duelo Amazônico', 'Emicida', 'Bonitinha Mais Ordinaria'];
    for (const f of folders) {
        console.log(`\n--- Arquivos em albums/${f} ---`);
        const res = await cloudinary.api.resources({
            type: 'upload',
            prefix: `albums/${f}`,
            max_results: 5
        });
        res.resources.forEach(r => console.log(`- ${r.public_id}`));
    }
}

checkCovers();
