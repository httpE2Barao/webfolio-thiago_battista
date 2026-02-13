// src/app/albuns/[id]/page.tsx

import { prisma } from "@/lib/prisma";
import type { Album, PageProps } from "@/types/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlbumCompletoClient } from "./AlbumCompleto";

async function getAlbumById(identifier: string): Promise<Album | null> {
  const normalizedSearch = identifier.replace(/-/g, ' ').trim();

  // 1. Tenta busca exata por ID ou Título
  let albumData = await prisma.album.findFirst({
    where: {
      OR: [
        { id: identifier },
        { id: identifier.toLowerCase() }, // Fallback for case sensitivity in ID
        { titulo: { equals: identifier, mode: 'insensitive' } }, // Match raw title (with dashes)
        { titulo: { equals: normalizedSearch, mode: 'insensitive' } } // Match normalized title
      ]
    },
    include: { Image: { orderBy: { ordem: 'asc' } } }
  });

  // 2. Se não achou, tenta busca por "contém" (flexível para "mas" vs "mais"), mas exigindo TODOS os termos
  if (!albumData) {
    const searchTerms = normalizedSearch.split(' ').filter(t => t.length > 3);
    if (searchTerms.length > 0) {
      albumData = await prisma.album.findFirst({
        where: {
          AND: searchTerms.map(term => ({
            titulo: { contains: term, mode: 'insensitive' }
          }))
        },
        include: { Image: { orderBy: { ordem: 'asc' } } }
      });
    }
  }

  if (!albumData) {
    return null;
  }

  return {
    id: albumData.id,
    titulo: albumData.titulo,
    descricao: albumData.descricao || '',
    categoria: albumData.categoria,
    subcategoria: albumData.subcategoria || '',
    imagens: albumData.Image.map((img: any) => ({
      id: img.id,
      imagem: img.path
    }))
  } as Album;
}

export async function generateMetadata({ params }: PageProps<{ id: string }>): Promise<Metadata> {
  const { id } = await params;
  const albumName = decodeURIComponent(id);
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
  const { id } = await params;
  const albumName = decodeURIComponent(id);
  const album = await getAlbumById(albumName);

  if (!album) {
    notFound();
  }

  return <AlbumCompletoClient album={album} albumName={albumName} />;
}
