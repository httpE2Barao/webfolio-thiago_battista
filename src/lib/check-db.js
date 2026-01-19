const { createClient } = require('@vercel/postgres');
const path = require('path');
require("dotenv").config({ path: path.join(process.cwd(), '.env') });

async function check() {
    console.log("Connecting using DATABASE_URL...");
    const client = createClient({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        const { rows } = await client.sql`SELECT id, titulo, imagens, "coverImage" FROM albums LIMIT 1`;
        if (rows.length > 0) {
            console.log("Album Sample:", JSON.stringify(rows[0], null, 2));
        } else {
            console.log("No albums found in database.");
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.end();
    }
}

check();
