// src/app/albuns/categoria/[categoria]/AlbumCategoryClient.tsx

"use client";

import { useRouter } from "next/navigation";
import { Projeto } from "@/types/types";
import TituloResponsivo from "@/components/TituloResponsivo";
import CustomSwiper from "@/components/CustomSwiper";

// 1. Definimos uma interface para as props que o componente espera receber
interface AlbumCategoryClientProps {
  albums: Projeto[];
  categoria: string;
}

// 2. Usamos a interface na assinatura da função e exportamos como default
export default function AlbumCategoryClient({ albums, categoria }: AlbumCategoryClientProps) {
  const router = useRouter();
  const formattedCategoria = categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase();

  // Agrupa os álbuns pelo título para mostrar uma seção por álbum
  const albumsByTitle = albums.reduce((acc: { [key: string]: Projeto[] }, album) => {
    const titulo = album.titulo || "Sem Título";
    if (!acc[titulo]) {
      acc[titulo] = [];
    }
    acc[titulo].push(album);
    return acc;
  }, {});

  if (!albums || albums.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <TituloResponsivo className="text-center mb-6">
          {formattedCategoria}
        </TituloResponsivo>
        <p className="text-xl text-center">
          Nenhum álbum encontrado nesta categoria no momento.
        </p>
        <button
          onClick={() => router.push("/albuns")}
          className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
        >
          Voltar para Álbuns
        </button>
      </div>
    );
  }

  const AlbumGroup = ({ titulo, albumPhotos }: { titulo: string; albumPhotos: Projeto[] }) => {
    return (
      <div className="mb-24 last:mb-12 group relative rounded-lg overflow-hidden">
        <div className="transition-transform duration-300 ease-in-out h-[400px] md:h-[500px] lg:h-[600px] relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <CustomSwiper 
              mode="fotos"
              photos={albumPhotos}
              tagName={titulo}
              hidePagination={false}
              onSlideClick={() => router.push(`/albuns/${encodeURIComponent(titulo)}`)}
            />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
            <div className={`transform transition-all duration-500`}>
              <TituloResponsivo className="text-white text-3xl md:text-5xl lg:text-6xl font-semibold px-4 py-2 rounded-md bg-black/30">
                {titulo.replace(/-/g, ' ')}
              </TituloResponsivo>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 py-12 px-4 md:px-8">
      <TituloResponsivo className="text-center mb-16">
        {formattedCategoria}
      </TituloResponsivo>
      {Object.entries(albumsByTitle)
        .filter(([_, photos]) => photos.length > 0)
        .map(([titulo, albumPhotos]) => (
          <AlbumGroup key={titulo} titulo={titulo} albumPhotos={albumPhotos} />
        ))}
    </div>
  );
}