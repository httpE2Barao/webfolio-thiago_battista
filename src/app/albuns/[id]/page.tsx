import { notFound } from "next/navigation";
import { projetos } from "@/data/projetos";
import type { Projetos, Album, PageProps } from "@/types/types";
import { AlbumCompletoClient } from "./AlbumCompleto";
import { Metadata } from "next";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const albumName = decodeURIComponent(resolvedParams.id);
  const albumData = (projetos as unknown as Projetos)[albumName];

  if (!albumData) {
    return {
      title: "Álbum não encontrado",
    };
  }

  return {
    title: `${albumData.titulo} - Thiago Battista`,
    description: albumData.descricao || "Álbum de fotos",
  };
}

export default async function AlbumCompleto({ params }: PageProps) {
  const resolvedParams = await params;
  const albumName = decodeURIComponent(resolvedParams.id);
  const album = (projetos as unknown as Projetos)[albumName] as Album | undefined;

  if (!album) {
    notFound();
  }

  return <AlbumCompletoClient album={album} albumName={albumName} />;
}
