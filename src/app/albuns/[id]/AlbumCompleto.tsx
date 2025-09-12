"use client"
import { useState } from "react";
import CustomSwiper from "@/components/CustomSwiper";
import TituloResponsivo from "@/components/TituloResponsivo";
import { Album } from "@/types/types";
import { OptimizedImage, useImagePreloader } from "@/components/OptimizedImage";

export function AlbumCompletoClient({
  album,
  albumName,
}: {
  album: Album;
  albumName: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  
  // Preload images for better performance
  const imageUrls = album.imagens.map(img => img.imagem);
  useImagePreloader(imageUrls);

  const handlePhotoClick = (index: number) => {
    setInitialIndex(index);
    setModalOpen(true);
  };

  return (
    <div className="lg:p-4 relative flex flex-col h-screen">
      <TituloResponsivo className="mb-2 text-center flex-none">
        {albumName.replace(/-/g, " ")}
      </TituloResponsivo>

      {album.descricao && (
        <p className="text-lg text-center mb-2 max-w-3xl mx-auto flex-none">
          {album.descricao}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 mt-2 flex-none">
        {album.imagens.map((imagem, index) => (
          <div
            key={imagem.id}
            className="relative w-full h-64 xl:h-80 cursor-pointer group overflow-hidden"
            onClick={() => handlePhotoClick(index)}
          >
            <OptimizedImage
              src={imagem.imagem}
              alt={album.titulo}
              className="object-cover object-center rounded-lg transition-transform duration-300 group-hover:scale-105 w-full h-full"
              priority={index < 4} // Priority for first 4 images
            />
          </div>
        ))}
      </div>

      {modalOpen && (
        <CustomSwiper
          mode="fotos"
          photos={album.imagens.map((img) => ({
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
