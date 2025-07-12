// src/app/albuns/[id]/page.tsx

import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import { AlbumCompletoClient } from "./AlbumCompleto";
import type { Album, PageProps } from "@/types/types"; // Importa a PageProps correta
import { Metadata } from "next";

async function getAlbumById(id: string): Promise<Album | null> {
  const { rows } = await sql`
    SELECT id, titulo, descricao, categoria, subcategoria, imagens 
    FROM albums WHERE id = ${id}
  `;

  if (rows.length === 0) {
    return null;
  }

  const albumData = rows[0];
  
  return {
    ...albumData,
    imagens: typeof albumData.imagens === 'string' 
      ? JSON.parse(albumData.imagens) 
      : albumData.imagens,
  } as Album;
}

export async function generateMetadata({ params }: PageProps<{ id: string }>): Promise<Metadata> {
  const albumName = decodeURIComponent(params.id);
  const album = await getAlbumById(albumName);

  if (!album) {
    return { title: "Álbum não encontrado" };
  }

  return {
    title: `${album.titulo} - Thiago Battista`,
    description: album.descricao || "Álbum de fotos",
  };
}

export default async function AlbumPage({ params }: PageProps<{ id: string }>) {
  const albumName = decodeURIComponent(params.id);
  const album = await getAlbumById(albumName);

  if (!album) {
    notFound();
  }

  return <AlbumCompletoClient album={album} albumName={albumName} />;
}
