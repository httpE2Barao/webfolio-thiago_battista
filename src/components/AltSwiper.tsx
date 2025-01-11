"use client";

import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

import projetosData from "@/data/projetos.js";
import { shuffleArray } from "@/lib/shuffleArray";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ProjectCard } from "./ProjectCard";

type ProjetoComAlbum = {
  id: string;
  titulo: string;
  descricao: string;
  imagem: string;
  album: string;
};

function getAllProjects(): ProjetoComAlbum[] {
  return Object.entries(projetosData.projetos).flatMap(([album, projetos]) =>
    projetos.map((projeto) => ({ ...projeto, album }))
  );
}

export default function AltSwiper() {
  const [shuffledProjects, setShuffledProjects] = useState<ProjetoComAlbum[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<string>("");

  useEffect(() => {
    const allProjects = getAllProjects();
    const shuffled = shuffleArray(allProjects);
    setShuffledProjects(shuffled);

    // Define o primeiro álbum
    if (shuffled.length > 0) {
      setCurrentAlbum(shuffled[0].album || "");
    }
  }, []);

  const handleSlideChange = (swiper: { realIndex: number }) => {
    const activeIndex = swiper.realIndex; // Swiper usa `realIndex` para loop
    const activeProject = shuffledProjects[activeIndex];
    setCurrentAlbum(activeProject?.album || "");
  };

  // Enquanto não houver dados, renderize um placeholder
  if (shuffledProjects.length === 0) {
    return <div className="w-full h-screen" />;
  }

  return (
    <div className="relative w-full h-screen">
      {/* Nome do álbum no topo */}
      <div className="absolute bottom-10 w-full text-center z-10">
        <h1 className="text-5xl font-light text-white px-4 py-2 rounded-md">
          {currentAlbum}
        </h1>
      </div>

      {/* Swiper */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        fadeEffect={{ crossFade: true }}
        loop={true}
        className="w-full h-screen"
        onSlideChange={handleSlideChange}
      >
        {shuffledProjects.map((projeto) => (
          <SwiperSlide key={projeto.id} className="w-full h-full">
            <ProjectCard projeto={projeto} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
