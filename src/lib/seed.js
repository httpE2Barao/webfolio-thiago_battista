// src/lib/seed.js - VERSÃO ROBUSTA

const { createClient } = require('@vercel/postgres');
const fs = require("fs");
const path = require("path");
const categoriesConfig = require("../config/categories");

// Carrega as variáveis do arquivo .env
require("dotenv").config();

async function createAlbumsTable(client) {
  console.log("Verificando e criando a tabela 'albums' se necessário...");
  const query = client.sql`
    CREATE TABLE IF NOT EXISTS albums (
      id VARCHAR(255) PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL,
      descricao TEXT,
      categoria VARCHAR(255),
      subcategoria VARCHAR(255),
      tags JSONB,
      imagens JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await query;
  console.log("Tabela 'albums' pronta.");
}

function getProjectCategory(folderName) {
  for (const [mainCategory, subcategories] of Object.entries(categoriesConfig)) {
    if (subcategories[folderName]) {
      return { main: mainCategory, sub: subcategories[folderName] };
    }
  }
  return { main: "outros", sub: "geral" };
};

async function seedAlbums(client) {
  const baseDir = path.join(process.cwd(), "public/images");
  const subFolders = fs.readdirSync(baseDir).filter(name => 
    fs.lstatSync(path.join(baseDir, name)).isDirectory()
  );

  console.log(`Encontrados ${subFolders.length} álbuns para processar.`);

  // Usamos Promise.all para rodar as inserções em paralelo
  await Promise.all(subFolders.map(async (folder) => {
    const folderPath = path.join(baseDir, folder);
    const files = fs.readdirSync(folderPath).filter(file => 
      /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file)
    );

    if (files.length === 0) {
      console.warn(`Nenhuma imagem encontrada na pasta: ${folder}`);
      return;
    }
    
    const { main, sub } = getProjectCategory(folder);
    const descricao = `Projeto fotográfico ${folder.replace(/-/g, " ")}`;
    const imagens = files.map(file => ({
      id: `${folder}-${path.parse(file).name}`,
      imagem: `/images/${folder}/${file}`,
    }));

    console.log(`Inserindo/atualizando álbum: ${folder}`);
    await client.sql`
      INSERT INTO albums (id, titulo, descricao, categoria, subcategoria, imagens)
      VALUES (${folder}, ${folder.replace(/-/g, " ")}, ${descricao}, ${main}, ${sub}, ${JSON.stringify(imagens)})
      ON CONFLICT (id) DO UPDATE
      SET
        titulo = EXCLUDED.titulo,
        descricao = EXCLUDED.descricao,
        categoria = EXCLUDED.categoria,
        subcategoria = EXCLUDED.subcategoria,
        imagens = EXCLUDED.imagens;
    `;
  }));
}

async function main() {
  // Conecta ao banco usando os parâmetros individuais do .env
  const client = createClient({
    host: '127.0.0.1', // Força o uso do IP direto
    port: 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: false, // Desativa o SSL para conexão local
  });

  try {
    await client.connect();
    console.log("Conectado ao banco de dados com sucesso!");

    await createAlbumsTable(client);
    await seedAlbums(client);
    
    console.log("Seed concluído com sucesso!");
  } catch (error) {
    console.error("Erro detalhado ao executar o script de seed:", error);
    process.exit(1);
  } finally {
    await client.end();
    console.log("Conexão com o banco de dados encerrada.");
  }
}

main();