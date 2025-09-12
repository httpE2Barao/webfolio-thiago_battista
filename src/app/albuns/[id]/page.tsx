import { notFound } from "next/navigation";
import { getCachedProjetos } from "@/lib/cache";
import type { Album, PageProps } from "@/types/types";
import { AlbumCompletoClient } from "./AlbumCompleto";
import { Metadata } from "next";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const albumName = decodeURIComponent(resolvedParams.id);
  const projetos = await getCachedProjetos();
  const albumData = projetos[albumName];

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
  const projetos = await getCachedProjetos();
  const album = projetos[albumName] as Album | undefined;

  if (!album) {
    notFound();
  }

  return <AlbumCompletoClient album={album} albumName={albumName} />;
}
