"use client";

import CustomSwiper from "@/components/CustomSwiper";
import LazySwiperWrapper from "@/components/LazySwiperWrapper";
import TituloResponsivo from "@/components/TituloResponsivo";
import { Projeto } from "@/types/types";
import { useRouter } from "next/navigation";
import { memo, useEffect, useState } from "react";

interface AlbunsClientProps {
  projetosPorCategoria: Record<string, Projeto[]>;
}

// Memoized component for a single category group
const CategoriaGroup = memo(({
  categoria,
  projetos,
  isFirst
}: {
  categoria: string;
  projetos: Projeto[];
  isFirst: boolean;
}) => {
  const router = useRouter();
  const [currentAlbumTitle, setCurrentAlbumTitle] = useState('');

  useEffect(() => {
    if (projetos.length > 0 && projetos[0]) {
      setCurrentAlbumTitle(projetos[0].titulo);
    }
  }, [projetos]);

  const swiperContent = (
    <div className="album-card mb-12 relative rounded-lg overflow-hidden h-[400px] md:h-[500px]">
      <div className="swiper-wrapper-for-zoom h-full w-full transition-transform duration-500 ease-in-out">
        <CustomSwiper
          mode="fotos"
          photos={projetos}
          priority={isFirst} // Only prioritize first category
          onSlideChange={(projeto) => setCurrentAlbumTitle(projeto.titulo)}
          onSlideClick={() => {
            router.push(`/albuns/categoria/${encodeURIComponent(categoria)}`);
          }}
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-black/30">
        {/* Category title (visible by default) */}
        <div className="title-container-categoria transition-opacity duration-300">
          <TituloResponsivo className="text-white text-shadow-lg capitalize">
            {categoria}
          </TituloResponsivo>
        </div>

        {/* Album title (visible on hover) */}
        <div className="title-container-album absolute transition-opacity duration-300 opacity-0">
          <h3 className="text-white text-3xl md:text-4xl font-semibold text-center capitalize text-shadow-lg">
            {currentAlbumTitle.replace(/-/g, ' ')}
          </h3>
        </div>
      </div>
    </div>
  );

  // First category loads immediately, others are lazy loaded
  if (isFirst) {
    return swiperContent;
  }

  return (
    <LazySwiperWrapper height="500px" rootMargin="300px">
      {swiperContent}
    </LazySwiperWrapper>
  );
});

CategoriaGroup.displayName = 'CategoriaGroup';

// Main component that renders all category groups
export default function AlbunsClient({ projetosPorCategoria }: AlbunsClientProps) {
  const categorias = Object.entries(projetosPorCategoria)
    .filter(([_, projetos]) => projetos.length > 0);

  return (
    <div className="w-full">
      {categorias.map(([categoria, projetos], index) => (
        <CategoriaGroup
          key={categoria}
          categoria={categoria}
          projetos={projetos}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}
