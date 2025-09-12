"use client";

import CustomSwiper from "@/components/CustomSwiper";
import TituloResponsivo from "@/components/TituloResponsivo";
import { Projeto } from "@/types/types";

export default function CategoriaGroup({
  categoria,
  projetos,
}: {
  categoria: string;
  projetos: Projeto[];
}) {
  const handleSlideClick = () => {
    window.location.href = `/albuns/categoria/${encodeURIComponent(categoria)}`;
  };

  return (
    <div className="mb-8 last:mb-0 group relative rounded-lg overflow-hidden dark:shadow-lg dark:hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
        {/* Background overlay - removido para mix-blend-mode funcionar */}
        
        {/* Swiper container */}
        <div className="absolute inset-0">
          <CustomSwiper
            mode="albuns"
            photos={projetos}
            tagName={categoria}
            hidePagination={false}
            onSlideClick={handleSlideClick}
          />
        </div>
        
        {/* Content overlay */}
        <div className="titulo-overlay">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <h1
              className="texto-invertido titulo text-center px-4"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                background: 'transparent'
              }}
            >
              {categoria}
            </h1>
            <p
              className="texto-invertido subtitulo text-center px-4"
              style={{
                fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                background: 'transparent'
              }}
            >
              {projetos.length} projetos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
