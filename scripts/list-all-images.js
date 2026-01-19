const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: 'dx9whz8ee',
    api_key: '312522471214743',
    api_secret: 'YJxlVBzx6G8uUKlXaK8feJ2OCRY',
});

async function findImages() {
    const folders = ['Bonitinha Mais Ordinaria', 'Sambas de Axé', 'Agora é que são elas'];
    for (const f of folders) {
        console.log(`\n--- ALL FILES in albums/${f} ---`);
        try {
            const result = await cloudinary.api.resources({
                type: 'upload',
                prefix: `albums/${f}`,
                max_results: 500
            });
            console.log(`Encontradas ${result.resources.length} fotos.`);
            result.resources.slice(0, 5).forEach(r => {
                console.log(`- ID: ${r.public_id} | URL: ${r.secure_url}`);
            });
        } catch (e) {
            console.error(`Erro na pasta ${f}:`, e.message);
        }
    }
}

findImages();
