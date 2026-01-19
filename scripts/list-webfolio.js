const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: 'dx9whz8ee',
    api_key: '312522471214743',
    api_secret: 'YJxlVBzx6G8uUKlXaK8feJ2OCRY',
});

async function listWebfolio() {
    console.log('--- Pastas dentro de "webfolio" ---');
    try {
        const result = await cloudinary.api.sub_folders('webfolio');
        console.log(result.folders.map(f => f.name));
    } catch (e) {
        console.error(e.message);
    }
}

listWebfolio();
