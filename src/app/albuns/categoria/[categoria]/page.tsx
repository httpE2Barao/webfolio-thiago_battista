import { Projeto, PageProps } from "@/types/types";
import { projetos as projetosData } from "@/data/projetos";
import { AlbumCategoryClient } from './AlbumCategoryClient';
import { Metadata } from "next";

// Helper to get all albums of a category with their complete photo sets
function getAlbunsByCategory(categoria: string): Projeto[] {
  const normalizedCategoria = categoria.toLowerCase().trim();

  return Object.entries(projetosData)
    .filter(([albumName, projetos]) => 
      projetos.some(projeto => 
        projeto.categoria?.toLowerCase() === normalizedCategoria ||
        projeto.subcategoria?.toLowerCase() === normalizedCategoria
      )
    )
    .flatMap(([albumName, projetos]) => 
      projetos.map(projeto => ({
        ...projeto,
        albumName,
        // Ensure each photo has the album title as its titulo if not already set
        titulo: projeto.titulo || albumName
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
  const albums = getAlbunsByCategory(categoria);

  return <AlbumCategoryClient albums={albums} categoria={categoria} />;
}
