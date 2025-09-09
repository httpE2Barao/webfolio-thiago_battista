// app/api/album-upload/route.ts

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

interface MetadataData {
  description: string;
  tags: string[];
}

interface AlbumData {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  tags: string[];
  imagens: string[]; // Apenas caminhos, sem id para cada imagem
}

/**
 * Regenera o arquivo de projetos (src/data/projetos.js) com base nas imagens em public/images.
 * Cada álbum é gerado como um objeto único com informações comuns e um array de caminhos de imagens.
 */
async function regenerateProjetos(): Promise<void> {
  const baseDir = path.join(process.cwd(), 'public', 'images');
  const outputDir = path.join(process.cwd(), 'src', 'data');
  const outputFile = path.join(outputDir, 'projetos.js');

  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(baseDir, { recursive: true });

  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  const subFolders = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
  if (subFolders.length === 0) {
    throw new Error(`Nenhuma subpasta encontrada em: ${baseDir}`);
  }

  const descriptions: Record<string, string> = {
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

  // Para simplificar, usamos "outros" e "geral" como categoria padrão
  const getProjectCategory = (_folderName: string): { main: string; sub: string } => {
    return { main: 'outros', sub: 'geral' };
  };

  const getDescription = (folderName: string, mainCategory: string): string =>
    `${descriptions[mainCategory] || descriptions.outros} ${folderName}`;

  const allProjects: Record<string, AlbumData> = {};

  async function getValidImageFiles(dir: string): Promise<string[]> {
    const files = await fs.readdir(dir);
    return files.filter(file => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }

  for (const folder of subFolders) {
    const folderPath = path.join(baseDir, folder);
    const files = await getValidImageFiles(folderPath);
    if (files.length === 0) {
      console.warn(`Nenhuma imagem encontrada na pasta: ${folder}`);
      continue;
    }
    const { main, sub } = getProjectCategory(folder);
    const descricao = getDescription(folder, main);
    // Armazena apenas os caminhos das imagens
    const imagens = files.map(file => `/images/${folder}/${file}`);
    allProjects[folder] = {
      id: folder,
      titulo: folder,
      descricao,
      categoria: main,
      subcategoria: sub,
      tags: [],
      imagens,
    };
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
 * Lê o arquivo categories.js e extrai o objeto de categorias.
 * Usa fs.readFile e uma expressão regular para extrair o objeto sem cache.
 */
async function readCategoriesFile(): Promise<Record<string, Record<string, string>>> {
  const configPath = path.join(process.cwd(), 'src', 'config', 'categories.js');
  let categoriesData: Record<string, Record<string, string>> = {};
  try {
    const fileContent = await fs.readFile(configPath, 'utf8');
    const match = fileContent.match(/const\s+categories\s*=\s*({[\s\S]*?});\s*module\.exports\s*=\s*categories;?/);
    if (match && match[1]) {
      categoriesData = new Function("return " + match[1])();
    } else {
      throw new Error("Formato do arquivo categories.js inválido.");
    }
  } catch (err) {
    console.error("Erro ao ler o arquivo de categorias:", err);
    categoriesData = {};
  }
  return categoriesData;
}

/**
 * Reescreve o arquivo categories.js com o objeto atualizado.
 */
async function writeCategoriesFile(categoriesData: Record<string, Record<string, string>>): Promise<void> {
  const configPath = path.join(process.cwd(), 'src', 'config', 'categories.js');
  const newContent = `const categories = ${JSON.stringify(categoriesData, null, 2)};\n\nmodule.exports = categories;`;
  await fs.writeFile(configPath, newContent, 'utf8');
  console.log(`Arquivo de categorias atualizado: ${configPath}`);
}

/**
 * Atualiza o arquivo de categorias com base nas tags enviadas, adicionando novos itens sem remover os existentes.
 */
async function updateCategories(albumName: string, tags: string[]): Promise<void> {
  const categoriesData = await readCategoriesFile();
  tags.forEach(tag => {
    // Padroniza a comparação para lowercase
    const lowerTag = tag.toLowerCase();
    let key = Object.keys(categoriesData).find(k => k.toLowerCase() === lowerTag);
    if (!key) {
      key = tag;
      categoriesData[key] = {};
    }
    categoriesData[key][albumName] = tag;
  });
  await writeCategoriesFile(categoriesData);
}

/**
 * Executa os comandos Git para fazer commit e push das alterações.
 * Se o remote "origin" não existir, ele é adicionado.
 */
async function commitAndPushChanges(): Promise<void> {
  try {
    const gitUser = process.env.GIT_USER;
    const gitEmail = process.env.GIT_EMAIL;
    const gitToken = process.env.GIT_TOKEN;
    const gitRemoteHost = process.env.GIT_REMOTE_HOST; // Ex: "github.com/usuario/repo.git"
    const branch = process.env.BRANCH || "main"; // Branch padrão: "main"

    if (!gitUser || !gitEmail || !gitToken || !gitRemoteHost) {
      console.error("Variáveis de ambiente para autenticação Git não estão configuradas.");
      return;
    }

    await execAsync(`git config user.name "${gitUser}"`);
    await execAsync(`git config user.email "${gitEmail}"`);

    const remoteUrl = `https://${gitUser}:${gitToken}@${gitRemoteHost}`;
    try {
      await execAsync(`git remote set-url origin ${remoteUrl}`);
    } catch (_e) {
      console.warn("Remote 'origin' não encontrado. Adicionando remote 'origin'.");
      await execAsync(`git remote add origin ${remoteUrl}`);
    }

    // Stashea alterações não stageadas para evitar conflitos
    try {
      await execAsync(`git stash`);
    } catch (error) {
      const stashError = error as Error;
      console.warn("Erro ao stashear alterações (talvez não haja alterações):", stashError.message);
    }

    await execAsync(`git pull --rebase origin ${branch}`);

    try {
      await execAsync(`git stash pop`);
    } catch (error) {
      const popError = error as Error;
      console.warn("Nenhum stash para restaurar:", popError.message);
    }

    await execAsync(`git add .`);
    await execAsync(`git commit -m "Auto-commit: atualizando projetos e categorias"`);
    
    // Push com refspec completo para evitar erro de destino não qualificado
    await execAsync(`git push origin HEAD:refs/heads/${branch}`);

    console.log("Commit e push realizados com sucesso.");
  } catch (error) {
    const pushError = error as Error;
    console.error("Erro ao executar git push:", pushError.message);
  }
}

/**
 * Endpoint POST para upload de álbum.
 * Salva as imagens e metadata, regenera projetos.js, atualiza categories.js e executa commit/push.
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
    await fs.mkdir(albumDir, { recursive: true });

    const files = formData.getAll('files');
    for (const file of files) {
      if (file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path.join(albumDir, file.name);
        await fs.writeFile(filePath, buffer);
      }
    }

    const metadata: MetadataData = { description, tags };
    const metadataPath = path.join(albumDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

    await regenerateProjetos();
    await updateCategories(albumName, tags);
    await commitAndPushChanges();

    return NextResponse.json({ message: 'Álbum enviado com sucesso!' }, { status: 200 });
  } catch (err: unknown) {
    console.error("Erro no upload do álbum:", err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
