const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: 'dx9whz8ee',
    api_key: '312522471214743',
    api_secret: 'YJxlVBzx6G8uUKlXaK8feJ2OCRY',
});

async function search() {
    console.log('--- Buscando resources com "Agora" no Cloudinary ---');
    try {
        const result = await cloudinary.search
            .expression('public_id:*Agora*')
            .max_results(100)
            .execute();

        console.log(`Encontrados ${result.total_count} resources.`);
        result.resources.forEach(r => {
            console.log(`- ${r.public_id} (${r.secure_url})`);
        });
    } catch (e) {
        console.error(e);
    }
}

search();
