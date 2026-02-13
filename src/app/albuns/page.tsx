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
  const [albuns, categories] = await Promise.all([
    prisma.album.findMany({
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
    }),
    prisma.category.findMany({
      orderBy: {
        ordem: 'asc'
      }
    })
  ]);

  const projetosPorCategoria = agruparAlbunsPorCategoria(albuns);

  // Create sorted entries based on DB categories
  const sortedCategories: { name: string, projetos: Projeto[] }[] = [];
  const usedCategories = new Set<string>();

  // 1. Add categories that exist in DB, in order
  categories.forEach((cat: { name: string }) => {
    const slug = cat.name.toLowerCase(); // Match logic in agruparAlbunsPorCategoria
    // Note: agruparAlbunsPorCategoria uses `album.categoria` which is the string name stored in Album.
    // We need to match loose strings.

    // Find matching key in projetosPorCategoria (case insensitive search)
    const key = Object.keys(projetosPorCategoria).find(k => k.toLowerCase() === slug.toLowerCase());

    if (key && projetosPorCategoria[key] && !usedCategories.has(key)) {
      sortedCategories.push({
        name: key, // Use the key from the grouping (which comes from album data)
        projetos: projetosPorCategoria[key]
      });
      usedCategories.add(key);
    }
  });

  // 2. Add remaining categories (not in DB or "outros")
  Object.keys(projetosPorCategoria).forEach(key => {
    if (!usedCategories.has(key)) {
      sortedCategories.push({
        name: key,
        projetos: projetosPorCategoria[key]
      });
    }
  });

  return (
    <div className="p-4 md:p-8">
      <AlbunsClient sortedCategories={sortedCategories} />
    </div>
  );
}


export const revalidate = 0;
