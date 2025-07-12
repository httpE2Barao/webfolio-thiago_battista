"use client";

import CustomSwiper from "@/components/CustomSwiper";
import TituloResponsivo from "@/components/TituloResponsivo";
import { Projeto } from "@/types/types";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface AlbunsClientProps {
  projetosPorCategoria: Record<string, Projeto[]>;
}

// Componente para um único grupo de categoria
const CategoriaGroup = ({ categoria, projetos }: { categoria: string; projetos: Projeto[] }) => {
  const router = useRouter();
  const [currentAlbumTitle, setCurrentAlbumTitle] = useState('');

  useEffect(() => {
    if (projetos.length > 0 && projetos[0]) {
      setCurrentAlbumTitle(projetos[0].titulo);
    }
  }, [projetos]);

  return (
    // 1. O contêiner principal agora tem uma classe 'album-card' para o CSS
    <div className="album-card mb-12 relative rounded-lg overflow-hidden h-[400px] md:h-[500px]">

      {/* 2. Este wrapper receberá o efeito de zoom via CSS */}
      <div className="swiper-wrapper-for-zoom h-full w-full transition-transform duration-500 ease-in-out">
        <CustomSwiper
          mode="fotos"
          photos={projetos}
          onSlideChange={(projeto) => setCurrentAlbumTitle(projeto.titulo)}
          onSlideClick={() => {
            router.push(`/albuns/categoria/${encodeURIComponent(categoria)}`);
          }}
        />
      </div>

      {/* 3. A sobreposição de títulos agora é estática, sem mudança de cor no hover */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-black/30">

        {/* Título da CATEGORIA (some no hover) */}
        <div className="title-container-categoria transition-opacity duration-300">
          <TituloResponsivo className="text-white text-shadow-lg capitalize">
            {categoria}
          </TituloResponsivo>
        </div>

        {/* Título do ÁLBUM (aparece no hover) */}
        <div className="title-container-album absolute transition-opacity duration-300 opacity-0">
          <h3 className="text-white text-3xl md:text-4xl font-semibold text-center capitalize text-shadow-lg">
            {currentAlbumTitle.replace(/-/g, ' ')}
          </h3>
        </div>
      </div>
    </div>
  );
};

// Componente principal que renderiza todos os grupos
export default function AlbunsClient({ projetosPorCategoria }: AlbunsClientProps) {
  return (
    <div className="w-full">
      {Object.entries(projetosPorCategoria)
        .filter(([_, projetos]) => projetos.length > 0)
        .map(([categoria, projetos]) => (
          <CategoriaGroup key={categoria} categoria={categoria} projetos={projetos} />
        ))}
    </div>
  );
}
