"use client";

import CustomSwiper from "@/components/CustomSwiper";
import TituloResponsivo from "@/components/TituloResponsivo";
import { projetos } from "@/data/projetos.js";
import { Projeto, Projetos } from "@/types/types";
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

const projetosData = projetos as Projetos;

// Atualizado: Função auxiliar para agrupar álbuns por categoria
function agruparProjetosPorCategoria(projetos: Projetos): Record<string, Projeto[]> {
  const projetosPorCategoria: Record<string, Projeto[]> = {};

  Object.entries(projetos).forEach(([albumName, albumData]) => {
    if (Array.isArray(albumData) && albumData.length > 0) {
      const mainCategory = albumData[0].categoria || 'outros';
      if (!projetosPorCategoria[mainCategory]) {
        projetosPorCategoria[mainCategory] = [];
      }
      projetosPorCategoria[mainCategory].push({
        ...albumData[0],
        albumName,
        id: albumName,
        titulo: albumName,
        imagem: albumData[0].imagem
      });
    }
  });

  return projetosPorCategoria;
}

export const dynamic = "force-dynamic";

export default function AlbunsPage() {
  const projetosPorCategoria = useMemo(() => agruparProjetosPorCategoria(projetosData), []);
  const router = useRouter();

  const CategoriaGroup = ({ categoria, projetos }: { categoria: string; projetos: Projeto[] }) => {
    return (
      <div className="mb-3 last:mb-0 group relative rounded-lg overflow-hidden">
        <div className="transition-transform duration-300 ease-in-out h-[400px] md:h-[500px] lg:h-[600px] relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <CustomSwiper 
              mode="albuns"
              photos={projetos}
              tagName={categoria}
              hidePagination={false}
              onSlideClick={() => {
                router.push(`/albuns/categoria/${encodeURIComponent(categoria)}`);
              }}
            />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none bg-gradient-to-t from-black/50 to-transparent">
            <TituloResponsivo className="text-white text-3xl md:text-5xl lg:text-6xl font-semibold px-4 py-2 rounded-md opacity-100 transition-all duration-300 group-hover:opacity-0 group-hover:transform group-hover:translate-y-4">
              {categoria}
            </TituloResponsivo>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-0 md:space-y-8 py-4">
      {Object.entries(projetosPorCategoria)
        .filter(([_, projetos]) => projetos.length > 0)
        .map(([categoria, projetos]) => (
          <CategoriaGroup key={categoria} categoria={categoria} projetos={projetos} />
        ))}
    </div>
  );
}