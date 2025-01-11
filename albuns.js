const fs = require("fs");
const path = require("path");

// Caminho da pasta com as imagens
const baseDir = path.join(process.cwd(), "public/images");

// Caminho do diretório e arquivo de saída
const outputDir = path.join(process.cwd(), "src/data");
const outputFile = path.join(outputDir, "projetos.js");

console.log("Base de Imagens:", baseDir);
console.log("Diretório de Saída:", outputDir);
console.log("Arquivo de Saída:", outputFile);

try {
    // Verifica se a pasta `src/data` existe, caso contrário, cria-a
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log("Diretório criado:", outputDir);
    } else {
        console.log("Diretório já existe:", outputDir);
    }

    // Verifica se a pasta `public/images` existe
    if (!fs.existsSync(baseDir)) {
        throw new Error(`A pasta de imagens não existe: ${baseDir}`);
    }

    // Verifica se o item é um diretório
    const isDirectory = (source) => fs.lstatSync(source).isDirectory();

    // Lê todas as subpastas dentro de `images`
    const subFolders = fs.readdirSync(baseDir).filter((name) => isDirectory(path.join(baseDir, name)));

    // Inicializa o objeto para armazenar todos os projetos
    const allProjects = {};

    // Processa cada subpasta
    subFolders.forEach((folder) => {
        const folderPath = path.join(baseDir, folder);
        const files = fs.readdirSync(folderPath).filter((file) => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));

        const projetos = files.map((file, index) => ({
            id: `${folder}-projeto${index + 1}`,
            titulo: `Projeto ${index + 1} (${folder})`,
            descricao: `Descrição breve do Projeto ${index + 1} na pasta ${folder}.`,
            imagem: `/images/${folder}/${file}`,
        }));

        allProjects[folder] = projetos;
    });

    // Gera o conteúdo do arquivo JavaScript
    const content = `
module.exports = {
    projetos: ${JSON.stringify(allProjects, null, 2)}
};
`;

    // Escreve o arquivo `projetos.js`
    fs.writeFileSync(outputFile, content);
    console.log(`Arquivo gerado com sucesso: ${outputFile}`);
} catch (error) {
    console.error("Erro ao gerar o arquivo:", error.message);
}
