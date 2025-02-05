"use client";

import CustomSwiper from "@/components/CustomSwiper";
import TituloResponsivo from "@/components/TituloResponsivo";
import rawData from "@/data/projetos.js";
import { Projeto, Projetos } from "@/data/types";
import { useMemo } from 'react';

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

  // Componente para renderizar cada grupo de tag
  const TagGroup = ({ tag, projetos }: { tag: string; projetos: Projeto[] }) => (
    <div className="mb-8 group relative">
      <div className="transition-all duration-300 ease-in-out group-hover:h-[35vh] h-[25vh] relative">
        <CustomSwiper 
          mode="albuns"
          photos={projetos}
          tagName={tag}
          hidePagination={false}
          priority={true} // Prioriza o carregamento das primeiras imagens
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none bg-black bg-opacity-20">
          <TituloResponsivo className="text-white text-6xl font-semibold px-4 py-2 rounded-md opacity-100 transition-opacity duration-300 group-hover:opacity-0">
            {tag}
          </TituloResponsivo>
          {projetos[0]?.categoria && (
            <TituloResponsivo className="text-white text-4xl font-light px-4 py-2 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {projetos[0].categoria}
            </TituloResponsivo>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12 py-8">
      {Object.entries(projetosPorTag).map(([tag, projetos]) => (
        <TagGroup key={tag} tag={tag} projetos={projetos} />
      ))}
    </div>
  );
}