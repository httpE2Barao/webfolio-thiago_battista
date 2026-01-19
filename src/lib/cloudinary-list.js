const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function listAll() {
    console.log("Listing resources in 'albums/'...");
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'albums/',
            max_results: 500,
        });

        console.log(`Found ${result.resources.length} resources.`);

        // Group by folder to see distribution
        const folders = {};
        result.resources.forEach(r => {
            // public_id is like "albums/Folder/Filename"
            const parts = r.public_id.split('/');
            const folder = parts.length > 2 ? parts[1] : 'root';
            folders[folder] = (folders[folder] || 0) + 1;
        });
        console.log("Distribution by album folder:", JSON.stringify(folders, null, 2));

        // Check a few samples 
        const samples = result.resources.slice(0, 10).map(r => ({
            public_id: r.public_id,
            display_name: r.display_name,
            url: r.secure_url
        }));
        console.log("Samples:", JSON.stringify(samples, null, 2));

    } catch (err) {
        console.error(err);
    }
}

listAll();
