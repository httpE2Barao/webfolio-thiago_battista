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

  // Garante que o array de imagens existe e não está vazio
  const imagensValidas = album?.imagens?.filter(img => img && img.imagem) || [];

  return (
    <div className="lg:p-4 relative flex flex-col min-h-screen">
      <TituloResponsivo className="mb-2 text-center flex-none">
        {albumName.replace(/-/g, " ")}
      </TituloResponsivo>

      {album.descricao && (
        <p className="text-lg text-center mb-2 max-w-3xl mx-auto flex-none">
          {album.descricao}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 mt-2 flex-grow">
        {/* MUDANÇAS AQUI:
        1. Usamos 'imagensValidas' para evitar erros de 'src' vazio.
        2. Adicionamos a prop 'key' usando o 'imagem.id', que é único.
      */}
        {imagensValidas.map((imagem, index) => (
          <div
            key={imagem.id} // <-- CORREÇÃO 1: Adicionada a key única
            className="relative w-full h-64 xl:h-80 cursor-pointer group overflow-hidden"
            onClick={() => handlePhotoClick(index)}
          >
            <Image
              src={imagem.imagem}
              alt={album.titulo}
              fill
              priority={index < 8} // Otimiza o carregamento das primeiras imagens
              quality={75}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ))}
      </div>

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