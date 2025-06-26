// app/api/album-upload/route.ts

import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';

/**
 * Endpoint POST para upload de um novo álbum.
 * 1. Recebe os dados do formulário (imagens, nome, descrição, tags).
 * 2. Faz o upload das imagens para o Vercel Blob.
 * 3. Salva os metadados e as URLs das imagens no Vercel Postgres.
 * 4. Revalida o cache das páginas de álbuns para exibir o novo conteúdo imediatamente.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    
    const albumName = formData.get('albumName') as string;
    const description = formData.get('description') as string;
    const tags = formData.getAll('tags') as string[];
    const files = formData.getAll('files') as File[];

    if (!albumName || files.length === 0) {
      return NextResponse.json({ error: 'Nome do álbum e pelo menos um arquivo são obrigatórios.' }, { status: 400 });
    }

    // --- 1. Upload das imagens para o Vercel Blob ---
    const imageUrls: string[] = [];
    for (const file of files) {
      if (file instanceof File) {
        // Define um caminho único para cada imagem no Blob Storage
        const blobPath = `albums/${albumName}/${file.name}`;
        
        const blob = await put(blobPath, file, {
          access: 'public', // Torna o arquivo publicamente acessível pela URL
        });

        imageUrls.push(blob.url); // Armazena a URL pública da imagem
      }
    }
    
    if (imageUrls.length === 0) {
        return NextResponse.json({ error: 'Nenhum arquivo válido foi processado para upload.' }, { status: 400 });
    }

    // --- 2. Inserção dos dados no Vercel Postgres ---
    // Usamos JSON.stringify para salvar os arrays de tags e imagens nas colunas JSONB
    await sql`
      INSERT INTO albums (id, titulo, descricao, tags, imagens)
      VALUES (${albumName}, ${albumName}, ${description}, ${JSON.stringify(tags)}, ${JSON.stringify(imageUrls)})
      ON CONFLICT (id) DO UPDATE 
      SET 
        titulo = EXCLUDED.titulo, 
        descricao = EXCLUDED.descricao, 
        tags = EXCLUDED.tags, 
        imagens = EXCLUDED.imagens;
    `;
    // ON CONFLICT...: Se um álbum com o mesmo nome já existir, ele será atualizado.

    // --- 3. Revalidação do Cache ---
    // Invalida o cache das páginas que listam os álbuns, para que o novo álbum apareça imediatamente.
    revalidatePath('/albuns'); // Ajuste o caminho se sua galeria principal for outra
    revalidatePath(`/albuns/${albumName}`); // Invalida a página do álbum específico

    return NextResponse.json({
      message: 'Álbum enviado com sucesso!',
      album: {
        name: albumName,
        uploaded_images: imageUrls,
      }
    }, { status: 200 });

  } catch (err: any) {
    console.error("Erro no processo de upload do álbum:", err);
    return NextResponse.json({ error: `Erro no servidor: ${err.message}` }, { status: 500 });
  }
}