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

// Ajuste para manter os campos exigidos em 'AlbumData'
interface AlbumData {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  tags: string[];
  imagens: { id: string; imagem: string }[];
}

/**
 * Regenera o arquivo de projetos (src/data/projetos.js) com base nas imagens em public/images.
 */
async function regenerateProjetos(): Promise<void> {
  const baseDir = path.join(process.cwd(), 'public', 'images');
  const outputDir = path.join(process.cwd(), 'src', 'data');
  const outputFile = path.join(outputDir, 'projetos.js');

  // Garante que os diretórios existam
  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(baseDir, { recursive: true });

  // Lê as subpastas (cada subpasta é um álbum)
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  const subFolders: string[] = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  if (subFolders.length === 0) {
    throw new Error(`Nenhuma subpasta encontrada em: ${baseDir}`);
  }

  // Função para obter as imagens válidas em uma pasta
  const getValidImageFiles = async (dirPath: string): Promise<string[]> => {
    const files = await fs.readdir(dirPath);
    return files
      .filter(file => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file))
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      );
  };

  // Identifica categoria principal e sub com base no nome da pasta
  const getProjectCategory = (folderName: string): { main: string; sub: string } => {
    for (const [mainCategory, subcategories] of Object.entries(categories) as [string, Record<string, string>][]) {
      if (subcategories[folderName]) {
        return { main: mainCategory, sub: subcategories[folderName] };
      }
    }
    console.warn(`Categoria não encontrada para a pasta: ${folderName}. Usando categoria padrão.`);
    return { main: "outros", sub: "geral" };
  };

  const descriptions: { [key: string]: string } = {
    shows: "Show fotográfico",
    teatro: "Peça teatral",
    gastronomia: "Projeto gastronômico",
    fineart: "Fine Art",
    revistas: "Editorial para revista",
    publicitario: "Ensaio publicitário",
    moda: "Editorial de moda",
    newface: "Ensaio New Face",
    outros: "Projeto",
  };

  const getDescription = (folderName: string, category: string): string =>
    `${descriptions[category] || descriptions.outros} ${folderName}`;

  // Objeto final contendo todos os álbuns
  const allProjects: Record<string, AlbumData> = {};

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

    // Mapeia as imagens para um array de { id, imagem }
    const imagens = files.map((file) => ({
      id: `${folder}-${path.parse(file).name}`,
      imagem: `/images/${folder}/${file}`,
    }));

    // Cria objeto do álbum com dados comuns e array de imagens
    allProjects[folder] = {
      id: folder,
      titulo: folder,
      descricao,
      categoria: main,
      subcategoria: sub,
      tags: [], // array vazio por padrão
      imagens,
    };
  }

  if (Object.keys(allProjects).length === 0) {
    throw new Error("Nenhum projeto foi processado. Verifique se existem imagens nas pastas.");
  }

  // Gera o arquivo final com export const projetos = ...
  const content = `// Este arquivo é gerado automaticamente - não edite manualmente
export const projetos = ${JSON.stringify(allProjects, null, 2)};`;

  await fs.writeFile(outputFile, content, 'utf8');
  console.log(`Arquivo gerado com sucesso: ${outputFile}`);
}

/**
 * Atualiza o arquivo de categorias (src/config/categories.js) com base nas tags enviadas,
 * sem sobrescrever o que já existe.
 */
async function updateCategories(albumName: string, tags: string[]): Promise<void> {
  const configPath = path.join(process.cwd(), 'src', 'config', 'categories.js');
  let categoriesData: Record<string, Record<string, string>> = {};

  try {
    // Limpa o cache e carrega o arquivo
    delete require.cache[require.resolve(configPath)];
    categoriesData = require(configPath);
  } catch (e) {
    console.error("Erro ao ler o arquivo de categorias:", e);
    categoriesData = {};
  }

  tags.forEach(tag => {
    const lowerTag = tag.toLowerCase();
    let key = Object.keys(categoriesData).find(
      k => k.toLowerCase() === lowerTag
    );
    // Se não existir, cria a nova categoria
    if (!key) {
      key = tag; 
      categoriesData[key] = {};
    }
    // Adiciona ou atualiza o mapeamento do álbum
    categoriesData[key][albumName] = tag;
  });

  // Reescreve o arquivo com module.exports
  const newContent = `const categories = ${JSON.stringify(categoriesData, null, 2)};\n\nmodule.exports = categories;`;
  await fs.writeFile(configPath, newContent, 'utf8');
  console.log(`Arquivo de categorias atualizado: ${configPath}`);
}

/**
 * Faz commit e push das mudanças, stashando alterações não stageadas e fazendo pull --rebase
 * antes do push para evitar conflitos.
 */
async function commitAndPushChanges(): Promise<void> {
  try {
    const gitUser = process.env.GIT_USER;
    const gitEmail = process.env.GIT_EMAIL;
    const gitToken = process.env.GIT_TOKEN;
    const gitRemoteHost = process.env.GIT_REMOTE_HOST; // e.g., "github.com/usuario/repo.git"

    if (!gitUser || !gitEmail || !gitToken || !gitRemoteHost) {
      console.error("Variáveis de ambiente para autenticação Git não estão configuradas.");
      return;
    }

    await execAsync(`git config user.name "${gitUser}"`);
    await execAsync(`git config user.email "${gitEmail}"`);

    const remoteUrl = `https://${gitUser}:${gitToken}@${gitRemoteHost}`;
    await execAsync(`git remote set-url origin ${remoteUrl}`);

    // Stash para evitar conflitos com rebase
    await execAsync(`git stash`);

    // Atualiza o repositório local com as mudanças remotas
    await execAsync(`git pull --rebase origin HEAD`);

    // Restaura o stash (ignora erro se não houver stash)
    await execAsync(`git stash pop || true`);

    // Commit e push
    await execAsync(`git add .`);
    await execAsync(`git commit -m "Auto-commit: atualizando projetos e categorias"`);
    await execAsync(`git push origin HEAD`);

    console.log("Commit e push realizados com sucesso.");
  } catch (error: any) {
    console.error("Erro ao executar git push:", error.message);
  }
}

/**
 * Endpoint POST para upload de álbum: 
 * 1) Salva arquivos de imagem na pasta /public/images/<albumName>
 * 2) Gera metadata.json
 * 3) Regenera projetos.js
 * 4) Atualiza categories.js
 * 5) Faz commit e push das alterações
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

    // Cria diretório do álbum
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

    // Cria metadata.json
    const metadata: MetadataData = { description, tags };
    const metadataPath = path.join(albumDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

    // Regenera projetos.js
    await regenerateProjetos();

    // Atualiza categories.js
    await updateCategories(albumName, tags);

    // Commit e push
    await commitAndPushChanges();

    return NextResponse.json({ message: 'Álbum enviado com sucesso!' }, { status: 200 });
  } catch (error: any) {
    console.error("Erro no upload do álbum:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
