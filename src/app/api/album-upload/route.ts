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
  imagens: {
    id: string;
    imagem: string;
  }[];
}

/**
 * Lê o arquivo categories.js, extrai o objeto principal e retorna como JSON.
 */
async function readCategoriesFile(): Promise<Record<string, Record<string, string>>> {
  const configPath = path.join(process.cwd(), 'src', 'config', 'categories.js');
  let categoriesData: Record<string, Record<string, string>> = {};

  try {
    // Lê o conteúdo de categories.js
    const fileContent = await fs.readFile(configPath, 'utf8');
    // Extrai somente o objeto categories de dentro do arquivo:
    const match = fileContent.match(/const\s+categories\s*=\s*({[\s\S]*?});\s*module\.exports\s*=\s*categories;?/);
    if (match && match[1]) {
      categoriesData = JSON.parse(match[1]);
    } else {
      console.warn("Não foi possível extrair o objeto categories do arquivo. Formato inválido?");
    }
  } catch (err) {
    console.error("Erro ao ler o arquivo categories.js:", err);
    // Se o arquivo não existe ou deu erro de parse, inicia vazio
    categoriesData = {};
  }
  return categoriesData;
}

/**
 * Reescreve o arquivo categories.js com o conteúdo do objeto categoriesData.
 */
async function updateCategories(albumName: string, tags: string[]): Promise<void> {
  const configPath = path.join(process.cwd(), 'src', 'config', 'categories.js');
  let categoriesData: Record<string, Record<string, string>> = {};

  try {
    // Lê o conteúdo inteiro do arquivo
    const fileContent = await fs.readFile(configPath, 'utf8');
    // Extrai o objeto JavaScript contido no arquivo usando regex
    const match = fileContent.match(/const\s+categories\s*=\s*({[\s\S]*?});\s*module\.exports\s*=\s*categories;?/);
    if (match && match[1]) {
      // Avalia o trecho extraído para obter o objeto (use new Function para evitar usar eval diretamente)
      categoriesData = new Function("return " + match[1])();
    } else {
      throw new Error("Formato do arquivo categories.js inválido.");
    }
  } catch (e) {
    console.error("Erro ao ler o arquivo de categorias:", e);
    // Se ocorrer erro, inicia com um objeto vazio (ou mantenha um padrão mínimo, se desejar)
    categoriesData = {};
  }

  // Para cada tag enviada, converte para lowercase para comparação
  tags.forEach(tag => {
    const lowerTag = tag.toLowerCase();
    let key = Object.keys(categoriesData).find(
      k => k.toLowerCase() === lowerTag
    );
    // Se a chave não existir, cria-a mantendo o valor original
    if (!key) {
      key = tag;
      categoriesData[key] = {};
    }
    // Adiciona ou atualiza o mapeamento para o álbum na respectiva categoria
    categoriesData[key][albumName] = tag;
  });

  // Prepara o conteúdo a ser escrito, mantendo o padrão original
  const newContent = `const categories = ${JSON.stringify(categoriesData, null, 2)};\n\nmodule.exports = categories;`;

  await fs.writeFile(configPath, newContent, 'utf8');
  console.log(`Arquivo de categorias atualizado: ${configPath}`);
}

async function regenerateProjetos(): Promise<void> {
  const baseDir = path.join(process.cwd(), 'public', 'images');
  const outputDir = path.join(process.cwd(), 'src', 'data');
  const outputFile = path.join(outputDir, 'projetos.js');

  await fs.mkdir(outputDir, { recursive: true });
  await fs.mkdir(baseDir, { recursive: true });

  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  const subFolders = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  if (subFolders.length === 0) {
    throw new Error(`Nenhuma subpasta encontrada em: ${baseDir}`);
  }

  // Ajuste aqui se quiser usar um arquivo de config "categories" fixo
  // ou se preferir algo estático
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

  function getDescription(folderName: string, mainCategory: string) {
    return `${descriptions[mainCategory] || descriptions.outros} ${folderName}`;
  }

  // Precisamos extrair a categoria do "categoriesData"? Podemos, ou usar "outros"
  // ou reutilizar o categories importado de forma estática. Depende do seu caso.

  const allProjects: Record<string, AlbumData> = {};

  // Cria a função getValidImageFiles
  async function getValidImageFiles(dir: string) {
    const files = await fs.readdir(dir);
    return files.filter(file => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }

  // Aqui, se quiser olhar categories, teria que usar readCategoriesFile ou algo do tipo
  // mas para simplificar, digamos que não.
  // Se quiser puxar subcategorias do categories.js, teria que parsear da mesma forma.
  function getProjectCategory(folderName: string) {
    // Fixo, ou "outros" se não achar
    // Se quiser de categories, parse e busque "categoriesData[anyCategory][folderName]"
    return {
      main: 'outros',
      sub: 'geral'
    };
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

    const imagens = files.map(file => ({
      id: `${folder}-${path.parse(file).name}`,
      imagem: `/images/${folder}/${file}`,
    }));

    allProjects[folder] = {
      id: folder,
      titulo: folder,
      descricao,
      categoria: main,
      subcategoria: sub,
      tags: [],
      imagens
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
 * Faz commit e push das mudanças
 */
async function commitAndPushChanges(): Promise<void> {
  try {
    const gitUser = process.env.GIT_USER;
    const gitEmail = process.env.GIT_EMAIL;
    const gitToken = process.env.GIT_TOKEN;
    const gitRemoteHost = process.env.GIT_REMOTE_HOST; // e.g., "github.com/usuario/repo.git"

    if (!gitUser || !gitEmail || !gitToken || !gitRemoteHost) {
      console.error("Variáveis de ambiente de Git não configuradas");
      return;
    }

    await execAsync(`git config user.name "${gitUser}"`);
    await execAsync(`git config user.email "${gitEmail}"`);

    const remoteUrl = `https://${gitUser}:${gitToken}@${gitRemoteHost}`;
    await execAsync(`git remote set-url origin ${remoteUrl}`);

    await execAsync(`git stash`);
    await execAsync(`git pull --rebase origin HEAD`);
    await execAsync(`git stash pop || true`);

    await execAsync(`git add .`);
    await execAsync(`git commit -m "Auto-commit: atualizando projetos e categorias"`);
    await execAsync(`git push origin HEAD`);
  } catch (err) {
    console.error("Erro ao executar git push:", err);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const description = formData.get('description') as string;
    const tags = formData.getAll('tags') as string[];
    const albumNameRaw = formData.get('albumName');
    if (!albumNameRaw || typeof albumNameRaw !== 'string') {
      throw new Error('Nome do álbum não fornecido ou inválido.');
    }
    const albumName = albumNameRaw;

    // Cria pasta public/images/<albumName>
    const publicDir = path.join(process.cwd(), 'public', 'images');
    const albumDir = path.join(publicDir, albumName);
    await fs.mkdir(albumDir, { recursive: true });

    // Salva as imagens
    const files = formData.getAll('files');
    for (const file of files) {
      if (file instanceof File) {
        const buffer = Buffer.from(await file.arrayBuffer());
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

    // Atualiza categories
    await updateCategories(albumName, tags);

    // Faz commit e push
    await commitAndPushChanges();

    return NextResponse.json({ message: 'Álbum enviado com sucesso!' }, { status: 200 });
  } catch (err: any) {
    console.error("Erro no upload do álbum:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
