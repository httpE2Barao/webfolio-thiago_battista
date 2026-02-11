// src/app/albuns/page.tsx

import { prisma } from '@/lib/prisma';
import type { Projeto } from '@/types/types';
import AlbunsClient from './AlbunsClient';

function agruparAlbunsPorCategoria(albuns: any[]): Record<string, Projeto[]> {
  const projetosPorCategoria: Record<string, Projeto[]> = {};

  albuns.forEach((album) => {
    if (!album.Image || album.Image.length === 0) {
      return;
    }

    const mainCategory = (album.categoria || "outros").trim().toLowerCase();
    if (!projetosPorCategoria[mainCategory]) {
      projetosPorCategoria[mainCategory] = [];
    }

    projetosPorCategoria[mainCategory].push({
      id: album.id,
      titulo: album.titulo,
      descricao: album.descricao || '',
      // Use coverImage if set, otherwise fall back to first image
      imagem: album.coverImage || album.Image[0]?.path || '/placeholder.jpg',
      coverImageMobile: album.coverImageMobile || undefined,
      coverImageDesktop: album.coverImageDesktop || undefined,
      coverImageMobilePosition: album.coverImageMobilePosition || undefined,
      coverImageDesktopPosition: album.coverImageDesktopPosition || undefined,
      categoria: album.categoria,
      subcategoria: album.subcategoria || '',
      albumName: album.titulo,
    });
  });

  return projetosPorCategoria;
}

export default async function AlbunsPage() {
  const albuns = await prisma.album.findMany({
    where: {
      published: true,
      isPrivate: false
    },
    include: {
      Image: {
        orderBy: {
          ordem: 'asc'
        }
      }
    },
    orderBy: {
      ordem: 'asc'
    }
  });

  const projetosPorCategoria = agruparAlbunsPorCategoria(albuns);

  return (
    <div className="p-4 md:p-8">
      <AlbunsClient projetosPorCategoria={projetosPorCategoria} />
    </div>
  );
}

export const revalidate = 0;
