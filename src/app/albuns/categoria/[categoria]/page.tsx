// src/app/albuns/categoria/[categoria]/page.tsx

import { sql } from '@/lib/db';
import { Projeto, PageProps } from "@/types/types"; // Voltamos a usar o PageProps global
import AlbumCategoryClient from './AlbumCategoryClient';
import { Metadata } from "next";

// Helper para buscar todos os álbuns de uma categoria específica
async function getAlbunsByCategory(categoria: string): Promise<Projeto[]> {
  const normalizedCategoria = categoria.toLowerCase().trim();

  const { rows: albums } = await sql`
    SELECT id, titulo, descricao, categoria, subcategoria, imagens 
    FROM albums 
    WHERE lower(categoria) = ${normalizedCategoria};
  `;

  if (albums.length === 0) {
    return [];
  }

  const allPhotos = albums.flatMap(album => {
    const imagensArray = typeof album.imagens === 'string' ? JSON.parse(album.imagens) : album.imagens || [];
    
    return imagensArray.map((imagem: { id: string, imagem: string }) => ({
      id: imagem.id,
      imagem: imagem.imagem,
      albumName: album.titulo,
      titulo: album.titulo || album.id,
      descricao: album.descricao,
      categoria: album.categoria,
      subcategoria: album.subcategoria,
    }));
  });

  return allPhotos;
}

// Gera os metadados dinamicamente usando o PageProps corrigido
export async function generateMetadata({ params }: PageProps<{ categoria: string }>): Promise<Metadata> {
  const categoria = decodeURIComponent(params.categoria || '');
  const formattedCategoria = categoria.charAt(0).toUpperCase() + categoria.slice(1);

  return {
    title: `${formattedCategoria} - Thiago Battista`,
    description: `Álbuns da categoria ${formattedCategoria}`,
  };
}

// A página Server Component usando o PageProps corrigido
export default async function CategoriaPage({ params }: PageProps<{ categoria: string }>) {
  const categoria = decodeURIComponent(params.categoria || '');
  const albums = await getAlbunsByCategory(categoria);

  return <AlbumCategoryClient albums={albums} categoria={categoria} />;
}
