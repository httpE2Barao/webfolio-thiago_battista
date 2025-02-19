import { notFound } from "next/navigation";
import { projetos } from "@/data/projetos";
import type { Projetos, PageProps } from "@/types/types";
import { AlbumCompletoClient } from "./AlbumCompleto";
import { Metadata } from "next";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const albumName = decodeURIComponent(resolvedParams.id);
  const albumData = (projetos as Projetos)[albumName];

  if (!albumData) {
    return {
      title: "Álbum não encontrado",
    };
  }

  return {
    title: `${albumName} - Thiago Battista`,
    description: albumData[0]?.descricao || "Álbum de fotos",
  };
}

export default async function AlbumCompleto({ params }: PageProps) {
  const resolvedParams = await params;
  const albumName = decodeURIComponent(resolvedParams.id);
  const album = (projetos as Projetos)[albumName];

  if (!album) {
    notFound();
  }

  return <AlbumCompletoClient album={album} albumName={albumName} />;
}