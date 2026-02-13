// src/app/albuns/categoria/[categoria]/page.tsx

import { prisma } from '@/lib/prisma';
import { PageProps, Projeto } from "@/types/types";
import { Metadata } from "next";
import AlbumCategoryClient from './AlbumCategoryClient';

// Helper para buscar todos os álbuns de uma categoria específica
async function getAlbunsByCategory(categoria: string): Promise<Projeto[]> {
  const normalizedCategoria = categoria.toLowerCase().trim();

  const albums = await prisma.album.findMany({
    where: {
      published: true,
      OR: [
        { categoria: { equals: normalizedCategoria, mode: 'insensitive' } },
        { subcategoria: { equals: normalizedCategoria, mode: 'insensitive' } }
      ]
    },
    orderBy: {
      ordem: 'asc'
    },
    include: {
      Image: {
        orderBy: {
          ordem: 'asc'
        }
      }
    }
  });

  if (albums.length === 0) {
    return [];
  }

  const allPhotos = albums.flatMap((album: any) => {
    return album.Image.map((imagem: any) => ({
      id: imagem.id,
      albumId: album.id, // Adicionado para navegação precisa
      imagem: imagem.path,
      albumName: album.titulo,
      titulo: album.titulo || album.id,
      descricao: album.descricao || '',
      categoria: album.categoria,
      subcategoria: album.subcategoria || '',
    }));
  });

  return allPhotos;
}

// Gera os metadados dinamicamente usando o PageProps corrigido
export async function generateMetadata({ params }: PageProps<{ categoria: string }>): Promise<Metadata> {
  const { categoria: categoriaParam } = await params;
  const categoria = decodeURIComponent(categoriaParam || '');
  const formattedCategoria = categoria.charAt(0).toUpperCase() + categoria.slice(1);

  return {
    title: `${formattedCategoria} - Thiago Battista`,
    description: `Álbuns da categoria ${formattedCategoria}`,
  };
}

// A página Server Component usando o PageProps corrigido
export default async function CategoriaPage({ params }: PageProps<{ categoria: string }>) {
  const { categoria: categoriaParam } = await params;
  const categoria = decodeURIComponent(categoriaParam || '');
  const albums = await getAlbunsByCategory(categoria);

  return <AlbumCategoryClient albums={albums} categoria={categoria} />;
}
