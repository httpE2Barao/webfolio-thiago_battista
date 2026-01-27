"use client";

import CustomSwiper from "@/components/CustomSwiper";
import { GridSkeleton, ImageLoader } from "@/components/LoadingStates";
import { ProtectedImage } from "@/components/ProtectedImage";
import TituloResponsivo from "@/components/TituloResponsivo";
import { getThumbUrl } from "@/lib/cloudinaryOptimize";
import { Album } from "@/types/types";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useRef, useState } from "react";

// Image card component with lazy loading
const ImageCard = ({
  imagem,
  albumTitle,
  index,
  onClick,
}: {
  imagem: { id: string; imagem: string };
  albumTitle: string;
  index: number;
  onClick: () => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const optimizedSrc = getThumbUrl(imagem.imagem);

  return (
    <div
      className="relative w-full h-64 xl:h-80 cursor-pointer group overflow-hidden rounded-lg bg-gray-900"
      onClick={onClick}
    >
      {!isLoaded && <ImageLoader />}
      <ProtectedImage
        src={optimizedSrc}
        alt={`${albumTitle} - foto ${index + 1}`}
        fill
        quality={60}
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
        className={`object-cover rounded-lg transition-all duration-500 group-hover:scale-105 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        loading={index < 8 ? "eager" : "lazy"}
        onLoad={() => setIsLoaded(true)}
      />
      {/* Light hover indicator */}
      <div className="absolute inset-0 z-20 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center pointer-events-none">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export function AlbumCompletoClient({
  album,
  albumName,
}: {
  album: Album;
  albumName: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(4);
  const [isMounted, setIsMounted] = useState(false);

  // Responsive column count
  useEffect(() => {
    setIsMounted(true);
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 768) setColumns(2);
      else if (width < 1280) setColumns(3);
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const handlePhotoClick = useCallback((index: number) => {
    setInitialIndex(index);
    setModalOpen(true);
  }, []);

  // Filter valid images - be resilient with property names
  const imagensValidas = album?.imagens?.filter(img => img && (img.imagem || (img as any).path)) || [];

  // Calculate rows for virtualization
  const rowCount = Math.ceil(imagensValidas.length / columns);

  // Virtualizer for rows - using window scroll to avoid double scrollbars
  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => (typeof window !== 'undefined' && window.innerWidth < 1280 ? 256 + 8 : 320 + 8), // height + gap-2
    overscan: 5,
    scrollMargin: containerRef.current?.offsetTop || 0,
  });

  return (
    <div className="lg:p-4 relative flex flex-col min-h-screen">
      <TituloResponsivo className="mb-2 text-center flex-none">
        {album.titulo}
      </TituloResponsivo>

      {album.descricao && (
        <p className="text-lg text-center mb-2 max-w-3xl mx-auto flex-none text-gray-400">
          {album.descricao}
        </p>
      )}

      {/* Image count indicator */}
      <p className="text-sm text-center text-gray-500 mb-6 uppercase tracking-widest">
        {imagensValidas.length} fotos
      </p>

      {/* Virtualized grid container */}
      <div
        ref={containerRef}
        className="flex-grow w-full max-w-7xl mx-auto px-4"
      >
        {!isMounted ? (
          <GridSkeleton />
        ) : (
          <div
            className="relative w-full"
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * columns;
              const rowImages = imagensValidas.slice(startIndex, startIndex + columns);

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute top-0 left-0 w-full grid gap-2"
                  style={{
                    transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    paddingBottom: '8px', // Equivalent to gap-2 in Y
                  }}
                >
                  {rowImages.map((imagem, colIndex) => {
                    const actualIndex = startIndex + colIndex;
                    return (
                      <ImageCard
                        key={imagem.id}
                        imagem={imagem}
                        albumTitle={album.titulo}
                        index={actualIndex}
                        onClick={() => handlePhotoClick(actualIndex)}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen modal with swiper */}
      {modalOpen && (
        <CustomSwiper
          mode="fotos"
          photos={imagensValidas.map((img) => ({
            ...img,
            titulo: album.titulo,
            descricao: album.descricao,
            categoria: album.categoria,
            subcategoria: album.subcategoria,
          }))}
          tagName={albumName}
          initialSlide={initialIndex}
          modal
          onClose={() => setModalOpen(false)}
          fullSize
        />
      )}
    </div>
  );
}

export default AlbumCompletoClient;

