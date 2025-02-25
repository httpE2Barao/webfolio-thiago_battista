const fs = require("fs");
const path = require("path");
const categories = require("./src/config/categories");

const baseDir = path.join(process.cwd(), "public/images");
const outputDir = path.join(process.cwd(), "src/data");
const outputFile = path.join(outputDir, "projetos.js");

try {
  // Garante que os diretórios existem
  [outputDir, baseDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const isDirectory = (source) => fs.lstatSync(source).isDirectory();
  const getValidImageFiles = (dirPath) =>
    fs.readdirSync(dirPath)
      .filter(file => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  const subFolders = fs.readdirSync(baseDir)
    .filter(name => isDirectory(path.join(baseDir, name)));

  if (subFolders.length === 0) {
    throw new Error(`Nenhuma subpasta encontrada em: ${baseDir}`);
  }

  const getProjectCategory = (folderName) => {
    for (const [mainCategory, subcategories] of Object.entries(categories)) {
      if (subcategories[folderName]) {
        return {
          main: mainCategory,
          sub: subcategories[folderName]
        };
      }
    }
    console.warn(`Categoria não encontrada para a pasta: ${folderName}. Usando categoria padrão.`);
    return {
      main: "outros",
      sub: "geral"
    };
  };

  const descriptions = {
    shows: "Show fotográfico",
    teatro: "Peça teatral",
    gastronomia: "Projeto gastronômico",
    fineart: "Fine Art",
    revistas: "Editorial para revista",
    publicitario: "Ensaio publicitário",
    moda: "Editorial de moda",
    newface: "Ensaio New Face",
    outros: "Projeto"
  };

  const getDescription = (folderName, category) =>
    `${descriptions[category] || descriptions.outros} ${folderName}`;

  const allProjects = {};

  // Processa cada subpasta
  subFolders.forEach((folder) => {
    const folderPath = path.join(baseDir, folder);
    const files = getValidImageFiles(folderPath);

    if (files.length === 0) {
      console.warn(`Nenhuma imagem encontrada na pasta: ${folder}`);
      return;
    }

    const { main, sub } = getProjectCategory(folder);
    const descricao = getDescription(folder, main);

    // Cria um array com os dados específicos de cada imagem
    const imagens = files.map((file) => ({
      id: `${folder}-${path.parse(file).name}`,
      imagem: `/images/${folder}/${file}`
    }));

    // Agrupa os dados comuns e as imagens em um único objeto para o projeto
    allProjects[folder] = {
      titulo: folder,
      descricao,
      categoria: main,
      subcategoria: sub,
      imagens
    };
  });

  if (Object.keys(allProjects).length === 0) {
    throw new Error("Nenhum projeto foi processado. Verifique se existem imagens nas pastas.");
  }

  const content = `// Este arquivo é gerado automaticamente - não edite manualmente
export const projetos = ${JSON.stringify(allProjects, null, 2)};`;

  fs.writeFileSync(outputFile, content, 'utf8');
  console.log(`Arquivo gerado com sucesso: ${outputFile}`);
} catch (error) {
  console.error("Erro ao gerar o arquivo:", error.message);
  process.exit(1);
}
