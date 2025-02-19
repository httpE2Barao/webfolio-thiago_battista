import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import categories from '@/config/categories';

interface MetadataData {
  description: string;
  tags: string[];
}

interface AlbumData {
  id: string;
  titulo: string;
  descricao: string;
  tags: string[];
  imagens: string[];
  categoria: string;
  subcategoria: string;
}

/**
 * Regenera o arquivo de projetos (src/data/projetos.js) com base nas imagens em public/images
 */
async function regenerateProjetos(): Promise<void> {
  const baseDir = path.join(process.cwd(), 'public', 'images');
  const outputDir = path.join(process.cwd(), 'src', 'data');
  const outputFile = path.join(outputDir, 'projetos.js');

  // Garante que os diretórios existam
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(baseDir, { recursive: true });

  // Lê as entradas (subpastas) da pasta base
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  const subFolders: string[] = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  if (subFolders.length === 0) {
    throw new Error(`Nenhuma subpasta encontrada em: ${baseDir}`);
  }

  // Função para obter os arquivos de imagem válidos em uma pasta
  const getValidImageFiles = async (dirPath: string): Promise<string[]> => {
    const files = await fs.readdir(dirPath);
    return files
      .filter(file => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file))
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      );
  };

  // Função para identificar a categoria principal e subcategoria com base no nome da pasta
  const getProjectCategory = (folderName: string): { main: string; sub: string } => {
    for (const [mainCategory, subcategories] of Object.entries(categories)) {
      if (subcategories.hasOwnProperty(folderName)) {
        return {
          main: mainCategory,
          sub: subcategories as string,
        };
      }
    }
    console.warn(`Categoria não encontrada para a pasta: ${folderName}. Usando categoria padrão.`);
    return { main: 'outros', sub: 'geral' };
  };  

  const descriptions: { [key: string]: string } = {
    shows: 'Show fotográfico',
    teatro: 'Peça teatral',
    gastronomia: 'Projeto gastronômico',
    fineart: 'Fine Art',
    revistas: 'Editorial para revista',
    publicitario: 'Ensaio publicitário',
    moda: 'Editorial de moda',
    newface: 'Ensaio New Face',
    outros: 'Projeto',
  };

  const getDescription = (folderName: string, category: string): string =>
    `${descriptions[category] || descriptions.outros} ${folderName}`;

  const allProjects: { [key: string]: AlbumData[] } = {};

  // Processa cada subpasta
  for (const folder of subFolders) {
    const folderPath = path.join(baseDir, folder);
    const files = await getValidImageFiles(folderPath);

    if (files.length === 0) {
      console.warn(`Nenhuma imagem encontrada na pasta: ${folder}`);
      continue;
    }

    const { main, sub } = getProjectCategory(folder);
    // Mapeia cada imagem para um objeto do álbum
    const projetos: AlbumData[] = files.map((file) => ({
      id: `${folder}-${path.parse(file).name}`,
      titulo: folder,
      descricao: getDescription(folder, main),
      tags: [],
      // Cada objeto possui somente uma imagem neste exemplo;
      // caso prefira agrupar todas as imagens em um único objeto, use:
      // imagens: files.map(f => `/images/${folder}/${f}`)
      imagens: [`/images/${folder}/${file}`],
      categoria: main,
      subcategoria: sub,
    }));

    allProjects[folder] = projetos;
  }

  if (Object.keys(allProjects).length === 0) {
    throw new Error("Nenhum projeto foi processado. Verifique se existem imagens nas pastas.");
  }

  const content = `// Este arquivo é gerado automaticamente - não edite manualmente
export const projetos = ${JSON.stringify(allProjects, null, 2)};`;

  await fs.writeFile(outputFile, content, 'utf8');
  console.log(`Arquivo gerado com sucesso: ${outputFile}`);
}

/**
 * Atualiza o arquivo de categorias (src/config/categories.js) com base nas tags enviadas.
 * Para cada tag enviada que corresponda a uma chave existente (case-insensitive),
 * adiciona ou atualiza o mapeamento do álbum.
 */
async function updateCategories(albumName: string, tags: string[]): Promise<void> {
  const configPath = path.join(process.cwd(), 'src', 'config', 'categories.js');

  // Lê o arquivo atual de categorias usando require.
  // Atenção: em ambiente de produção, alterações em arquivos de configuração podem não ser recarregadas automaticamente.
  let categoriesData: Record<string, Record<string, string>>;
  try {
    categoriesData = require(configPath);
  } catch (e) {
    console.error("Erro ao ler o arquivo de categorias:", e);
    categoriesData = {};
  }

  // Atualiza as categorias: para cada tag enviada, verifica se a chave existe e adiciona o novo álbum.
  tags.forEach(tag => {
    // Procura por uma chave que corresponda (case-insensitive)
    const key = Object.keys(categoriesData).find(
      k => k.toLowerCase() === tag.toLowerCase()
    );
    if (key) {
      // Adiciona o álbum à categoria, mapeando albumName para o valor desejado (aqui, usamos o próprio tag)
      categoriesData[key][albumName] = tag;
    }
  });

  const content = `module.exports = ${JSON.stringify(categoriesData, null, 2)};`;
  await fs.writeFile(configPath, content, 'utf8');
  console.log(`Arquivo de categorias atualizado: ${configPath}`);
}

/**
 * Endpoint POST para upload de álbum.
 * Após salvar as imagens e metadata, regenera o arquivo de projetos
 * e atualiza o arquivo de categorias.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const description = formData.get('description') as string;
    const tags = formData.getAll('tags') as string[];
    const albumNameRaw = formData.get('albumName');
    if (!albumNameRaw || typeof albumNameRaw !== 'string') {
      throw new Error('Nome do álbum não fornecido ou inválido.');
    }
    const albumName = albumNameRaw;

    const publicDir = path.join(process.cwd(), 'public', 'images');
    const albumDir = path.join(publicDir, albumName);

    // Cria o diretório do álbum, se não existir
    await fs.mkdir(albumDir, { recursive: true });

    // Salva os arquivos enviados
    const files = formData.getAll('files');
    for (const file of files) {
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filePath = path.join(albumDir, file.name);
        await fs.writeFile(filePath, buffer);
      }
    }

    // Escreve o arquivo de metadata para o álbum
    const metadata: MetadataData = { description, tags };
    const metadataPath = path.join(albumDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

    // Regenera o arquivo projetos.js após o upload
    await regenerateProjetos();

    // Atualiza o arquivo de categorias com as tags enviadas
    await updateCategories(albumName, tags);

    return NextResponse.json({ message: 'Álbum enviado com sucesso!' }, { status: 200 });
  } catch (error: any) {
    console.error("Erro no upload do álbum:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
