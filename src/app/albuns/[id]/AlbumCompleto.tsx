"use client";
import { Projeto } from "@/data/types";
import Image from "next/image";
import { useState } from "react";
import CustomSwiper from "../../../components/CustomSwiper";

export function AlbumCompletoClient({
  album,
  albumName,
}: {
  album: Projeto[];
  albumName: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const handlePhotoClick = (index: number) => {
    setInitialIndex(index);
    setModalOpen(true);
  };

  return (
    <div className="lg:p-6 relative">
      <h1 className="text-responsive font-bold mb-8 text-center capitalize">
        {albumName.replace(/-/g, ' ')}
      </h1>
      <div className="h-[calc(100vh-200px)] mb-8">
        <CustomSwiper 
          mode="fotos"
          photos={album}
          tagName={albumName}
          hidePagination={false}
          onSlideClick={(_, index) => handlePhotoClick(index)}
          fullSize
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {album.map((projeto, index) => (
          <div
            key={projeto.id}
            className="relative w-full h-80 xl:h-96 cursor-pointer group overflow-hidden"
            onClick={() => handlePhotoClick(index)}
          >
            <Image
              src={projeto.imagem}
              alt={projeto.titulo}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        ))}
      </div>

      {modalOpen && (
        <CustomSwiper
          mode="fotos"
          photos={album}
          tagName={albumName}
          initialSlide={initialIndex}
          modal
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
