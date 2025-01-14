"use client";

import CustomSwiper from "@/components/CustomSwiper";
import TituloResponsivo from "@/components/TituloResponsivo";
import rawData from "@/data/projetos.js";
import { Projetos } from "@/data/types";

const data: { projetos: Projetos } = rawData;

const projetosData: Projetos = data.projetos;

import "swiper/css/navigation";
import "swiper/css/pagination";

export const dynamic = "force-dynamic";

export default function AlbunsPage() {
  const tags = Array.from(new Set(Object.values(projetosData).flatMap(projeto => projeto.flatMap(p => p.tags))));

  return (
    <div>
      {tags.map((tag) => (
        <div key={tag} className="mb-8 flex flex-col gap-5">
          <TituloResponsivo>{tag}</TituloResponsivo>
          <CustomSwiper mode="albuns" tagName={tag||""} hidePagination={true} />
        </div>
      ))}
    </div>
  );
}