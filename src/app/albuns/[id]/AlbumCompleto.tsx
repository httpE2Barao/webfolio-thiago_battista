"use client"
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
      <div className="p-6 relative">
        <h1 className="text-responsive font-bold mb-8 text-center capitalize">
          {albumName}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {album.map((projeto, index) => (
            <div
              key={projeto.id}
              className="relative w-full h-80 xl:h-96 cursor-pointer"
              onClick={() => handlePhotoClick(index)}
            >
              <Image
                src={projeto.imagem}
                alt={projeto.titulo}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
  
        {/* Renderiza o modal com o CustomSwiper somente se modalOpen for true */}
        {modalOpen && (
          <CustomSwiper
            mode="shuffle"
            photos={album}
            albumName={albumName}
            initialSlide={initialIndex}
            modal
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    );
  }