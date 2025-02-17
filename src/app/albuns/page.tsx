"use client";

import CustomSwiper from "@/components/CustomSwiper";
import TituloResponsivo from "@/components/TituloResponsivo";
import rawData from "@/data/projetos.js";
import { Projeto, Projetos } from "@/data/types";
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

const data: { projetos: Projetos } = rawData;
const projetosData: Projetos = data.projetos;

// Função auxiliar para agrupar projetos por tag
function agruparProjetosPorTag(projetos: Projetos) {
  const projetosPorTag: { [key: string]: Projeto[] } = {};
  
  Object.entries(projetos).forEach(([categoria, albumProjetos]) => {
    if (albumProjetos.length > 0) {
      const primeiroProjeto = albumProjetos[0];
      primeiroProjeto.tags?.forEach(tag => {
        if (!projetosPorTag[tag]) {
          projetosPorTag[tag] = [];
        }
        if (!projetosPorTag[tag].some(p => p.categoria === categoria)) {
          projetosPorTag[tag].push(primeiroProjeto);
        }
      });
    }
  });

  return projetosPorTag;
}

import "swiper/css/navigation";
import "swiper/css/pagination";

export const dynamic = "force-dynamic";

export default function AlbunsPage() {
  const projetosPorTag = useMemo(() => agruparProjetosPorTag(projetosData), []);
  const router = useRouter();

  const TagGroup = ({ tag, projetos }: { tag: string; projetos: Projeto[] }) => (
    <div className="mb-3 last:mb-0 group relative rounded-lg overflow-hidden">
      <div className="transition-transform duration-300 ease-in-out h-[400px] md:h-[500px] lg:h-[600px] relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <CustomSwiper 
            mode="albuns"
            photos={projetos}
            tagName={tag}
            hidePagination={false}
            priority={true}
            onSlideClick={(projeto) => {
              if (projeto.categoria) {
                router.push(`/albuns/${encodeURIComponent(projeto.categoria)}`);
              }
            }}
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none bg-gradient-to-t from-black/50 to-transparent">
          <TituloResponsivo className="text-white text-3xl md:text-5xl lg:text-6xl font-semibold px-4 py-2 rounded-md opacity-100 transition-all duration-300 group-hover:opacity-0 group-hover:transform group-hover:translate-y-4">
            {tag}
          </TituloResponsivo>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 py-4">
      {Object.entries(projetosPorTag).map(([tag, projetos]) => (
        <TagGroup key={tag} tag={tag} projetos={projetos} />
      ))}
    </div>
  );
}