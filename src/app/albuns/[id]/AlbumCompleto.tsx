"use client"
import Image from "next/image";
import { useState } from "react";
import CustomSwiper from "@/components/CustomSwiper";
import TituloResponsivo from "@/components/TituloResponsivo";
import { Album } from "@/types/types";

export function AlbumCompletoClient({
  album,
  albumName,
}: {
  album: Album;
  albumName: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

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
            <Image
              src={imagem.imagem}
              alt={album.titulo}
              fill
              priority
              quality={40}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
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
