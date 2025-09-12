import { prisma } from "@/lib/prisma";
import { cache } from "react";

export interface AlbumData {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  imagens: { id: string; imagem: string }[];
  imagem: string;
  albumName?: string;
  tags?: string[];
}

export interface ProjetosCache {
  [key: string]: AlbumData;
}

// Simple cache implementation
let projetosCache: ProjetosCache | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 3600000; // 1 hora em milissegundos

const getCachedProjetos = cache(async (): Promise<ProjetosCache> => {
  const now = Date.now();
  
  if (projetosCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('✅ Cache: Using cached projetos data');
    return projetosCache;
  }
  
  try {
    console.log('🔄 Cache: Fetching projetos from database...');
    const albums = await prisma.album.findMany({
      where: {
        published: true
      },
      include: {
        Category: true,
        Image: {
          orderBy: {
            ordem: 'asc'
          }
        }
      },
      orderBy: {
        ordem: 'asc'
      },
    });
    console.log('✅ Cache: Found', albums.length, 'albums');

    const transformedAlbums = albums.reduce((acc: ProjetosCache, album) => {
      const albumKey = album.titulo;
      acc[albumKey] = {
        id: albumKey,
        titulo: album.titulo || '',
        descricao: album.descricao || `${album.categoria} ${album.titulo}`,
        categoria: album.categoria || '',
        subcategoria: album.subcategoria || '',
        imagem: album.Image[0]?.path || '',
        imagens: album.Image.map((image) => ({
          id: `${albumKey}-${image.id}`,
          imagem: image.path || ''
        })),
        tags: []
      };
      return acc;
    }, {} as ProjetosCache);

    projetosCache = transformedAlbums;
    cacheTimestamp = now;
    return transformedAlbums;
  } catch (error) {
    console.error('❌ Cache: Error fetching projetos:', error);
    return {};
  }
});

// Cache para categorias
let categoriasCache: Record<string, AlbumData[]> | null = null;
let categoriasTimestamp = 0;
const CATEGORIAS_CACHE_DURATION = 1800000; // 30 minutos em milissegundos

const getCachedCategorias = cache(async (): Promise<Record<string, AlbumData[]>> => {
  const now = Date.now();
  
  if (categoriasCache && (now - categoriasTimestamp) < CATEGORIAS_CACHE_DURATION) {
    console.log('✅ Cache: Using cached categorias data');
    return categoriasCache;
  }
  
  console.log('🔄 Cache: Fetching categorias...');
  const projetos = await getCachedProjetos();
  
  const projetosPorCategoria: Record<string, AlbumData[]> = {};

  Object.entries(projetos).forEach(([albumName, albumData]) => {
    if (!albumData.imagens || albumData.imagens.length === 0) {
      return;
    }

    const mainCategory = albumData.categoria || "outros";
    if (!projetosPorCategoria[mainCategory]) {
      projetosPorCategoria[mainCategory] = [];
    }

    projetosPorCategoria[mainCategory].push({
      id: albumName,
      titulo: albumName,
      descricao: albumData.descricao,
      imagem: albumData.imagens[0]?.imagem || '',
      categoria: albumData.categoria,
      subcategoria: albumData.subcategoria,
      albumName,
      imagens: albumData.imagens,
      tags: []
    } as AlbumData);
  });

  categoriasCache = projetosPorCategoria;
  categoriasTimestamp = now;
  console.log('✅ Cache: Found', Object.keys(projetosPorCategoria).length, 'categorias');
  return projetosPorCategoria;
});

// Função para invalidar cache quando necessário
export async function revalidateProjetosCache() {
  console.log('🔄 Cache: Invalidating cache...');
  projetosCache = null;
  categoriasCache = null;
  cacheTimestamp = 0;
  categoriasTimestamp = 0;
  
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/albuns');
  revalidatePath('/api/projetos');
  console.log('✅ Cache: Cache invalidated successfully');
}

export { getCachedProjetos, getCachedCategorias };