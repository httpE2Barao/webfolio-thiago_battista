"use client";

import CustomSwiper from "@/components/CustomSwiper";
import LazySwiperWrapper from "@/components/LazySwiperWrapper";
import TituloResponsivo from "@/components/TituloResponsivo";
import { getSwiperUrl } from "@/lib/cloudinaryOptimize";
import { Projeto } from "@/types/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { memo, useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";

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
    <div className="album-card mb-12 relative rounded-2xl overflow-hidden h-[400px] md:h-[500px] shadow-2xl">
      <div className="swiper-wrapper-for-zoom h-full w-full">
        {projetos.length > 1 ? (
          <div className="flex flex-col md:flex-row w-full h-full overflow-hidden bg-black">
            {projetos.slice(0, 6).map((projeto, i) => (
              <div
                key={projeto.id}
                className="relative h-full flex-1 hover:flex-[4] transition-all duration-700 ease-in-out group/slat overflow-hidden cursor-pointer border-b md:border-b-0 md:border-r border-white/5 last:border-b-0 last:border-r-0"
                onMouseEnter={() => setCurrentAlbumTitle(projeto.titulo)}
                onClick={() => router.push(`/albuns/categoria/${encodeURIComponent(categoria)}`)}
              >
                <div className="absolute inset-0 z-10 bg-black/15 group-hover/slat:bg-transparent transition-colors duration-500" />
                <Image
                  src={getSwiperUrl(projeto.imagem)}
                  alt={projeto.titulo}
                  fill
                  className="object-cover transition-transform duration-700 group-hover/slat:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={isFirst && i === 0}
                  style={{
                    objectPosition: (projeto.coverImageDesktopPosition || 'center')
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <CustomSwiper
            mode="fotos"
            photos={projetos}
            priority={isFirst} // Only prioritize first category
            onSlideChange={(projeto) => setCurrentAlbumTitle(projeto.titulo)}
            onSlideClick={() => {
              router.push(`/albuns/categoria/${encodeURIComponent(categoria)}`);
            }}
          />
        )}
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-black/20 group-hover:bg-black/40 transition-colors duration-500">
        {/* Category title (visible by default) */}
        <div className="title-container-categoria transition-opacity duration-300">
          <TituloResponsivo className="text-white text-shadow-lg capitalize">
            {categoria}
          </TituloResponsivo>
        </div>

        {/* Album title (visible on hover) */}
        <div className="title-container-album absolute transition-all duration-500 opacity-0 translate-y-4 flex flex-col items-center gap-3">
          <h3 className="text-white text-3xl md:text-5xl font-black text-center uppercase tracking-tighter text-shadow-lg">
            {currentAlbumTitle.replace(/-/g, ' ')}
          </h3>
          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/10 transition-colors">
            <span className="text-white/80 text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
              {categoria}
            </span>
            <FiArrowRight className="text-white animate-pulse" size={16} />
          </div>
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
