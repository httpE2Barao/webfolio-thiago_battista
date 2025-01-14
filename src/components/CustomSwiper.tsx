"use client";

import { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Projeto, Projetos } from "@/data/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Autoplay, EffectFade, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import data from "@/data/projetos.js";
import { shuffleArray } from "@/lib/shuffleArray";

// Tipos para os slides gerados
// Altere para refletir o uso de tags em vez de álbuns
type RandomizedTag = {
  tagName: string;
  foto: Projeto;
};

type ProjetoComTag = Projeto & {
  tagName: string;
};

// Modifique as props para refletir a exibição por tags
type CustomSwiperProps = {
  mode: "random" | "shuffle";
  photos?: Projeto[]; // Caso seja usado para exibir fotos filtradas por tag (passado via props)
  initialSlide?: number; // Slide inicial (por exemplo, foto clicada no grid)
  modal?: boolean; // Se true, renderiza com estilo de modal
  onClose?: () => void; // Função para fechar o modal
  tagName?: string; // Nome da tag (se aplicável)
  hidePagination?: boolean;
};

export default function CustomSwiper({
  mode,
  photos,
  initialSlide = 0,
  modal = false,
  onClose,
  tagName = "",
  hidePagination = false,
}: CustomSwiperProps) {
  const router = useRouter();
  const [slides, setSlides] = useState<RandomizedTag[] | ProjetoComTag[]>([]);
  const [currentTag, setCurrentTag] = useState<string>("");

  useEffect(() => {
    if (photos) {
      const slidesFromPhotos: ProjetoComTag[] = photos.map((projeto, index) => ({
        ...projeto,
        tagName,
        id: `${tagName}-${index}-${projeto.titulo}`, // Gera uma chave única para cada projeto
      }));
      console.log("Generated slides from photos:", slidesFromPhotos);
      setSlides(slidesFromPhotos);
      if (slidesFromPhotos.length > 0) {
        setCurrentTag(tagName);
      }
    } else {
      const projetos: Projetos = data.projetos;
      if (mode === "random") {
        const randomized: RandomizedTag[] = shuffleArray(
          Object.entries(projetos).map(([tagName, fotos]) => ({
            tagName,
            foto: fotos[Math.floor(Math.random() * fotos.length)],
          }))
        );
        console.log("Generated randomized slides:", randomized);
        setSlides(randomized);
        if (randomized.length > 0) {
          setCurrentTag(randomized[0].tagName);
        }
      } else if (mode === "shuffle") {
        const allProjects: ProjetoComTag[] = Object.entries(projetos).flatMap(
          ([tagName, projetos]) =>
            projetos.map((projeto, index) => ({
              ...projeto,
              tagName,
              id: `${tagName}-${index}-${projeto.titulo}`, // Gera uma chave única para cada projeto
            }))
        );
        console.log("Generated shuffled slides:", allProjects);
        const shuffled = shuffleArray(allProjects);
        setSlides(shuffled);
        if (shuffled.length > 0) {
          setCurrentTag(shuffled[0].tagName);
        }
      }
    }
  }, [mode, photos, tagName]);
  

  const handleSlideChange = (swiper: SwiperType) => {
    const activeIndex = swiper.realIndex;
    const activeSlide = slides[activeIndex];

    if (!activeSlide) return;

    if (photos) {
      setCurrentTag(tagName);
    } else {
      if (mode === "random" && "tagName" in activeSlide) {
        setCurrentTag(activeSlide.tagName);
      } else if (mode === "shuffle" && "tagName" in activeSlide) {
        setCurrentTag(activeSlide.tagName);
      }
    }
  };

  const containerClasses = modal
    ? "fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
    : `relative w-full ${mode === "shuffle" ? "h-[50vh]" : "h-[calc(100vh-35px)]"}`;

  return (
    <div className={containerClasses}>
      {/* No modo não-modal e para o mode "shuffle", exibe o nome da tag */}
      {mode === "shuffle" && !modal && (
        <div className="absolute bottom-5 w-full text-center z-10">
          <h1 className="text-5xl font-light text-white px-4 py-2 rounded-md">
            {currentTag}
          </h1>
        </div>
      )}

      <Swiper
        modules={[Navigation, Autoplay, EffectFade, Keyboard, ...(hidePagination ? [] : [Pagination])]}
        effect={mode === "shuffle" ? "fade" : undefined}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={!hidePagination ? { clickable: true } : undefined}
        keyboard={{ enabled: true }}
        autoplay={{ delay: 5000, disableOnInteraction: true }}
        fadeEffect={{ crossFade: true }}
        loop={slides.length > 1}
        initialSlide={initialSlide}
        className="w-full h-full"
        onSlideChange={handleSlideChange}
      >
        {slides.map((slide, index) => {
          if (!photos && mode === "random") {
            const { tagName, foto } = slide as RandomizedTag;

            // Ensure `foto` and `foto.imagem` exist before rendering
            if (!foto || !foto.imagem) {
              console.log(`Invalid slide data at index ${index}:`, slide);
              return null; // Skip rendering this slide
            }

            const key = `${slide.tagName}-${index}`;
            return (
              <SwiperSlide
                key={key}
                onClick={() => {
                  if (!modal) router.push(`/albuns/${encodeURIComponent(tagName)}`);
                }}
                className="cursor-pointer relative"
              >
                <div className="relative w-full h-full overflow-hidden rounded-md">
                  <Image
                    src={foto.imagem}
                    alt={tagName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h2 className="text-white text-responsive font-semibold capitalize">
                      {tagName}
                    </h2>
                  </div>
                </div>
              </SwiperSlide>
            );
          } else {
            const projeto = slide as ProjetoComTag;

            // Ensure `projeto` and `projeto.imagem` exist before rendering
            if (!projeto || !projeto.imagem) {
              console.error(`Invalid project data at index ${index}:`, slide);
              return null; // Skip rendering this slide
            }

            return (
              <SwiperSlide
                key={projeto.id}
                className="relative flex items-center justify-center"
                onClick={modal ? onClose : undefined}
              >
                <div
                  className={
                    modal
                      ? "relative w-[90vw] h-full max-w-[1200px] flex items-center justify-center m-auto"
                      : "relative w-full h-full overflow-hidden rounded-md"
                  }
                >
                  <Image
                    src={projeto.imagem}
                    alt={projeto.titulo}
                    fill
                    sizes={modal ? "80vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"}
                    className={modal ? "object-contain" : "object-cover"}
                    priority
                    onClick={(e) => e.stopPropagation()} 
                  />
                </div>
                {modal && (
                  <button
                    onClick={onClose}
                    className="absolute top-6 right-6 bg-white text-black rounded-full px-4 py-1 text-5xl z-60 shadow-lg hover:bg-gray-100"
                    aria-label="Fechar"
                  >
                    &times;
                  </button>
                )}
              </SwiperSlide>
            );
          }
        })}
      </Swiper>
    </div>
  );
}
