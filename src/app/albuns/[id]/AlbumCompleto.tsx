"use client"
import { useState } from "react";
import CustomSwiper from "@/components/CustomSwiper";
import TituloResponsivo from "@/components/TituloResponsivo";
import { Album } from "@/types/types";
import { ProgressiveImageGallery } from "@/components/ProgressiveImageGallery";
import { useImageCacheManager } from "@/hooks/useImageCache";

export function AlbumCompletoClient({
  album,
  albumName,
}: {
  album: Album;
  albumName: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const { preloadImages } = useImageCacheManager();
  
  // Preload images for better performance
  const imageUrls = album.imagens.map(img => img.imagem);
  preloadImages(imageUrls);

  // Preparar dados para a galeria
  const galleryImages = album.imagens.map((imagem, index) => ({
    id: imagem.id,
    src: imagem.imagem,
    alt: album.titulo,
    width: 400,
    height: 400,
    onClick: () => handlePhotoClick(index),
  }));

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

      <div className="flex-1 overflow-auto">
        <ProgressiveImageGallery
          images={galleryImages}
          itemsPerLoad={12}
          initialLoadCount={12}
          className="pb-4"
          imageClassName="aspect-square"
          columns={4}
        />
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
