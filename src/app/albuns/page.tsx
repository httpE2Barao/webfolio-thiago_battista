// src/app/albuns/page.tsx

import { sql } from '@/lib/db';
import type { Projeto, Album } from '@/types/types';
import AlbunsClient from './AlbunsClient';

interface AlbumDoBanco extends Album {
  id: string;
}

function agruparAlbunsPorCategoria(albuns: AlbumDoBanco[]): Record<string, Projeto[]> {
  const projetosPorCategoria: Record<string, Projeto[]> = {};

  albuns.forEach((album) => {
    if (!album.imagens || album.imagens.length === 0) {
      return;
    }

    const mainCategory = (album.categoria || "outros").trim().toLowerCase();
    if (!projetosPorCategoria[mainCategory]) {
      projetosPorCategoria[mainCategory] = [];
    }
    
    projetosPorCategoria[mainCategory].push({
      id: album.id,
      titulo: album.titulo,
      descricao: album.descricao,
      imagem: album.imagens[0].imagem,
      categoria: album.categoria,
      subcategoria: album.subcategoria,
      albumName: album.titulo,
    });
  });

  return projetosPorCategoria;
}

export default async function AlbunsPage() {
  const { rows } = await sql`
    SELECT id, titulo, descricao, categoria, subcategoria, imagens
    FROM albums ORDER BY titulo ASC;
  `;

  // CORREÇÃO: Usamos o spread operator `...row` para copiar todas as propriedades.
  const albunsCompletos: AlbumDoBanco[] = rows.map(row => ({
    ...row,
    imagens: typeof row.imagens === 'string' ? JSON.parse(row.imagens) : (row.imagens || []),
  })) as AlbumDoBanco[];

  const projetosPorCategoria = agruparAlbunsPorCategoria(albunsCompletos);

  return (
    <div className="p-4 md:p-8">
      <AlbunsClient projetosPorCategoria={projetosPorCategoria} />
    </div>
  );
}

export const revalidate = 0;
