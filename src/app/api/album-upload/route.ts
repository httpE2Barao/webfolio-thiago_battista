// app/api/album-upload/route.ts

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import categories from '@/config/categories';

const execAsync = util.promisify(exec);

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
    for (const [mainCategory, subcategories] of Object.entries(categories) as [string, Record<string, string>][]) {
      if (folderName in subcategories) {
        return {
          main: mainCategory,
          sub: subcategories[folderName],
        };
      }
    }
    console.warn(`Categoria não encontrada para a pasta: ${folderName}. Usando categoria padrão.`);
    return {
      main: "outros",
      sub: "geral",
    };
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
    const descricao = getDescription(folder, main);

    // Mapeia cada imagem para um objeto do álbum
    const projetos: AlbumData[] = files.map((file) => ({
      id: `${folder}-${path.parse(file).name}`,
      titulo: folder,
      descricao,
      tags: [],
      // Cada objeto possui somente uma imagem; se preferir agrupar todas as imagens, use:
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
 * Apenas adiciona os novos itens sem excluir os existentes.
 */
async function updateCategories(albumName: string, tags: string[]): Promise<void> {
  const configPath = path.join(process.cwd(), 'src', 'config', 'categories.js');
  let categoriesData: Record<string, Record<string, string>> = {};

  try {
    // Lê o conteúdo inteiro do arquivo
    const fileContent = await fs.readFile(configPath, 'utf8');
    // Extrai o objeto JSON contido no arquivo usando uma expressão regular
    const match = fileContent.match(/const\s+categories\s*=\s*({[\s\S]*?});\s*module\.exports\s*=\s*categories;?/);
    if (match && match[1]) {
      categoriesData = JSON.parse(match[1]);
    } else {
      throw new Error("Formato do arquivo categories.js inválido.");
    }
  } catch (e) {
    console.error("Erro ao ler o arquivo de categorias:", e);
    // Se ocorrer erro, inicia com um objeto vazio (ou mantenha um padrão mínimo, se desejar)
    categoriesData = {};
  }

  // Para cada tag enviada, verifica se a chave já existe (comparação case-insensitive)
  tags.forEach(tag => {
    let key = Object.keys(categoriesData).find(
      k => k.toLowerCase() === tag.toLowerCase()
    );
    // Se a chave não existir, cria-a
    if (!key) {
      key = tag;
      categoriesData[key] = {};
    }
    // Adiciona ou atualiza o mapeamento para o álbum na respectiva categoria
    categoriesData[key][albumName] = tag;
  });

  // Prepara o conteúdo a ser escrito, seguindo o mesmo padrão do arquivo original
  const newContent = `const categories = ${JSON.stringify(categoriesData, null, 2)};\n\nmodule.exports = categories;`;

  await fs.writeFile(configPath, newContent, 'utf8');
  console.log(`Arquivo de categorias atualizado: ${configPath}`);
}

/**
 * Executa os comandos Git para fazer commit e push das alterações, utilizando variáveis de ambiente para autenticação.
 */
async function commitAndPushChanges(): Promise<void> {
  try {
    const gitUser = process.env.GIT_USER;
    const gitEmail = process.env.GIT_EMAIL;
    const gitToken = process.env.GIT_TOKEN;
    const gitRemoteHost = process.env.GIT_REMOTE_HOST; // Ex: "github.com/usuario/repo.git"

    if (!gitUser || !gitEmail || !gitToken || !gitRemoteHost) {
      console.error("Variáveis de ambiente para autenticação Git não estão configuradas.");
      return;
    }

    await execAsync(`git config user.name "${gitUser}"`);
    await execAsync(`git config user.email "${gitEmail}"`);

    // Atualiza a URL do remote origin para incluir o token
    const remoteUrl = `https://${gitUser}:${gitToken}@${gitRemoteHost}`;
    await execAsync(`git remote set-url origin ${remoteUrl}`);

    await execAsync(`git add .`);
    await execAsync(`git commit -m "Auto-commit: atualizando projetos e categorias"`);
    await execAsync(`git push origin HEAD`);
    console.log("Commit e push realizados com sucesso.");
  } catch (error: any) {
    console.error("Erro ao executar git push:", error.message);
  }
}

/**
 * Endpoint POST para upload de álbum.
 * Após salvar as imagens e metadata, regenera o arquivo de projetos,
 * atualiza as categorias e executa o commit/push.
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

    // Executa o commit e push das alterações
    await commitAndPushChanges();

    return NextResponse.json({ message: 'Álbum enviado com sucesso!' }, { status: 200 });
  } catch (error: any) {
    console.error("Erro no upload do álbum:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
