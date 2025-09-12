import { Projeto, PageProps } from "@/types/types";
import { getCachedProjetos } from "@/lib/cache";
import { AlbumCategoryClient } from './AlbumCategoryClient';
import { Metadata } from "next";

// Helper to get all albums of a category with their complete photo sets
async function getAlbunsByCategory(categoria: string): Promise<Projeto[]> {
  const normalizedCategoria = categoria.toLowerCase().trim();
  const projetosData = await getCachedProjetos();

  return Object.entries(projetosData)
    .filter(([, album]) =>
      album.categoria?.toLowerCase() === normalizedCategoria ||
      album.subcategoria?.toLowerCase() === normalizedCategoria
    )
    .flatMap(([albumName, album]) =>
      album.imagens.map(imagem => ({
        id: imagem.id,
        imagem: imagem.imagem,
        albumName,
        titulo: album.titulo || albumName,
        descricao: album.descricao,
        categoria: album.categoria,
        subcategoria: album.subcategoria
      }))
    )
    .filter(projeto =>
      projeto.categoria?.toLowerCase() === normalizedCategoria ||
      projeto.subcategoria?.toLowerCase() === normalizedCategoria
    );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Directly use params because it’s a synchronous object
  const resolvedParams = await params;
  const categoria = decodeURIComponent(resolvedParams.categoria || '');
  return {
    title: `${categoria} - Thiago Battista`,
    description: `Álbuns da categoria ${categoria}`,
  };
}

export default async function CategoriaPage({ params }: PageProps) {
  // Await params to get the resolved value
  const resolvedParams = await params;
  const categoria = decodeURIComponent(resolvedParams.categoria || '');
  const albums = await getAlbunsByCategory(categoria);

  return <AlbumCategoryClient albums={albums} categoria={categoria} />;
}
