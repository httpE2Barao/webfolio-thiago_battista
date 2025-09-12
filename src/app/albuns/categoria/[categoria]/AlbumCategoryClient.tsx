"use client";

import { useRouter } from "next/navigation";
import { Projeto } from "@/types/types";
import TituloResponsivo from "@/components/TituloResponsivo";
import CustomSwiper from "@/components/CustomSwiper";

interface AlbumCategoryClientProps {
  albums: Projeto[];
  categoria: string;
}

export function AlbumCategoryClient({ albums, categoria }: AlbumCategoryClientProps) {
  const router = useRouter();
  const formattedCategoria = categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase();

  // Group albums by title to show one section per album
  const albumsByTitle = albums.reduce((acc: { [key: string]: Projeto[] }, album) => {
    if (!acc[album.titulo]) {
      acc[album.titulo] = [];
    }
    acc[album.titulo].push(album);
    return acc;
  }, {});

  if (!albums || albums.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6">
          <TituloResponsivo className="text-4xl md:text-6xl mb-6">
            {formattedCategoria}
          </TituloResponsivo>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
            <p className="text-gray-800 dark:text-gray-200 text-xl text-center mb-6">
              Nenhum álbum encontrado nesta categoria no momento.
            </p>
            <button
              onClick={() => router.push("/albuns")}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
              style={{
                backgroundColor: 'var(--button-primary)'
              }}
            >
              ← Voltar para Álbuns
            </button>
          </div>
        </div>
      </div>
    );
  }

  const AlbumGroup = ({ titulo, albumPhotos }: { titulo: string; albumPhotos: Projeto[] }) => {
    const handleSlideClick = () => {
      router.push(`/albuns/${encodeURIComponent(titulo)}`);
    };

    return (
      <div className="mb-16 last:mb-12 group relative rounded-lg overflow-hidden dark:shadow-lg dark:hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
          {/* Background overlay - removido para mix-blend-mode funcionar */}

          {/* Swiper container */}
          <div className="absolute inset-0">
            <CustomSwiper
              mode="fotos"
              photos={albumPhotos}
              tagName={titulo}
              hidePagination={false}
              onSlideClick={handleSlideClick}
            />
          </div>

          {/* Content overlay */}
          <div className="titulo-overlay">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <h1
                className="texto-invertido titulo text-center px-4"
                style={{
                  fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                  background: 'transparent'
                }}
              >
                {titulo.replace(/-/g, ' ')}
              </h1>
              <p
                className="texto-invertido subtitulo text-center px-4"
                style={{
                  fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                  background: 'transparent'
                }}
              >
                {albumPhotos.length} fotos
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <div className="text-center py-16 px-4">
        <TituloResponsivo className="text-4xl md:text-6xl lg:text-7xl mb-6">
          {formattedCategoria}
        </TituloResponsivo>
        <div className="flex justify-center space-x-8 text-gray-600 dark:text-gray-400 text-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>{Object.keys(albumsByTitle).length} álbuns</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span>{albums.length} fotos</span>
          </div>
        </div>
      </div>

      {/* Albums grid */}
      <div className="pb-20 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {Object.entries(albumsByTitle)
            .filter(([, photos]) => photos.length > 0)
            .map(([titulo, albumPhotos]) => (
              <AlbumGroup key={titulo} titulo={titulo} albumPhotos={albumPhotos} />
            ))}
        </div>
      </div>
    </div>
  );
}