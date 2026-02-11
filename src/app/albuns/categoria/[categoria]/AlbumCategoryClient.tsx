// src/app/albuns/categoria/[categoria]/AlbumCategoryClient.tsx

"use client";

import CustomSwiper from "@/components/CustomSwiper";
import TituloResponsivo from "@/components/TituloResponsivo";
import { Projeto } from "@/types/types";
import { useRouter } from "next/navigation";
import { memo } from "react";

interface AlbumCategoryClientProps {
  albums: Projeto[];
  categoria: string;
}

// Memoized album group component
const AlbumGroup = memo(({
  titulo,
  albumPhotos,
  isFirst
}: {
  titulo: string;
  albumPhotos: Projeto[];
  isFirst: boolean;
}) => {
  const router = useRouter();

  const swiperContent = (
    <div className="group flex flex-col gap-6">
      <div className="relative h-[350px] sm:h-[400px] md:h-[600px] lg:h-[700px] w-full overflow-visible md:px-10">
        {/* Pilha de Fotos Interativa - Permitindo navegar por todo o álbum */}
        <CustomSwiper
          mode="fotos"
          photos={albumPhotos}
          tagName={titulo}
          priority={isFirst}
          effect="cards"
          onSlideClick={() => router.push(`/albuns/${encodeURIComponent(titulo)}?cat=${encodeURIComponent(albumPhotos[0]?.categoria || '')}`)}
        />
      </div>

      {/* Legenda/Info em baixo da pilha */}
      <div
        className="flex flex-col items-center gap-1 cursor-pointer transition-transform duration-300 group-hover:-translate-y-1"
        onClick={() => router.push(`/albuns/${encodeURIComponent(titulo)}?cat=${encodeURIComponent(albumPhotos[0]?.categoria || '')}`)}
      >
        <h3 className="text-white text-xl md:text-2xl font-black uppercase tracking-tighter text-center">
          {titulo.replace(/-/g, ' ')}
        </h3>
        <div className="flex items-center gap-2 text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
          <span>{albumPhotos[0]?.categoria}</span>
          <span>•</span>
          <span>{albumPhotos.length} fotos</span>
        </div>
      </div>
    </div>
  );

  // Simplificado: Removemos o LazySwiperWrapper para garantir renderização imediata
  return swiperContent;
});

AlbumGroup.displayName = 'AlbumGroup';

export default function AlbumCategoryClient({ albums, categoria }: AlbumCategoryClientProps) {
  const router = useRouter();
  const formattedCategoria = categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase();

  // Group albums by title
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

  const albumEntries = Object.entries(albumsByTitle).filter(([_, photos]) => photos.length > 0);

  return (
    <div className="space-y-20 py-12 px-4 md:px-12 max-w-[1400px] mx-auto">
      <TituloResponsivo className="text-center mb-24">
        {formattedCategoria}
      </TituloResponsivo>

      <div className="grid grid-cols-1 gap-y-32">
        {albumEntries.map(([titulo, albumPhotos], index) => (
          <AlbumGroup
            key={titulo}
            titulo={titulo}
            albumPhotos={albumPhotos}
            isFirst={index === 0}
          />
        ))}
      </div>
    </div>
  );
}