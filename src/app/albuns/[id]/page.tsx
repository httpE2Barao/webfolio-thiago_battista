import { notFound } from "next/navigation";
import data from "../../../data/projetos.js";
import type { Projetos } from "../../../data/types";

// Extrai os projetos
const { projetos } = data as { projetos: Projetos };

interface Params {
  id: string;
}

interface PageProps {
  params: Promise<Params>;
}

import { AlbumCompletoClient } from "./AlbumCompleto";

export default async function AlbumCompleto({ params }: PageProps): Promise<JSX.Element> {
  const resolvedParams = await params;

  if (!resolvedParams.id) {
    notFound();
  }

  const decodedId = decodeURIComponent(resolvedParams.id);
  const album = projetos[decodedId];

  if (!album || album.length === 0) {
    notFound();
  }

  return <AlbumCompletoClient album={album} albumName={decodedId} />;
}
