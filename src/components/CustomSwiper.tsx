"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import { Projeto, Projetos } from "@/data/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import data from "@/data/projetos.js";
import { shuffleArray } from "@/lib/shuffleArray";
import TituloResponsivo from "./TituloResponsivo";

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
  mode: "albuns" | "fotos" | "tags";
  photos?: Projeto[]; // Caso seja usado para exibir fotos filtradas por tag (passado via props)
  initialSlide?: number; // Slide inicial (por exemplo, foto clicada no grid)
  modal?: boolean; // Se true, renderiza com estilo de modal
  onClose?: () => void; // Função para fechar o modal
  tagName?: string; // Nome da tag (se aplicável)
  hidePagination?: boolean;
  titleField?: string;
  onSlideClick?: (projeto: Projeto, index: number) => void;
  fullSize?: boolean;
  priority?: boolean; // Nova prop para controlar prioridade de carregamento
  onSlideChange?: (projeto: Projeto) => void;
};

export default function CustomSwiper({
  mode,
  photos,
  initialSlide = 0,
  modal = false,
  onClose,
  tagName = "",
  hidePagination = false,
  onSlideClick,
  fullSize = false,
  priority = false,
  onSlideChange,
}: CustomSwiperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [slides, setSlides] = useState<RandomizedTag[] | ProjetoComTag[]>([]);
  const [activeIndex, setActiveIndex] = useState(initialSlide);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTitle, setCurrentTitle] = useState("");
  const isHomePage = pathname === "/";

  useEffect(() => {
    const loadSlides = async () => {
      setIsLoading(true);
      try {
        if (photos) {
          const slidesFromPhotos: ProjetoComTag[] = photos.map((projeto, index) => ({
            ...projeto,
            tagName: projeto.categoria || tagName,
            id: `${tagName}-${index}-${projeto.titulo}`,
          }));
          setSlides(slidesFromPhotos);
        } else {
          const projetos: Projetos = data.projetos;
          if (mode === "albuns") {
            const randomized: RandomizedTag[] = shuffleArray(
              Object.entries(projetos)
                .map(([albumName, fotos]) => {
                  if (fotos && fotos.length > 0) {
                    return {
                      tagName: albumName,
                      foto: fotos[0],
                    };
                  }
                  return null;
                })
                .filter((item): item is RandomizedTag => item !== null)
            ).slice(0, 20);

            setSlides(randomized);
          } else if (mode === "fotos" && tagName) {
            const albumPhotos = projetos[tagName] || [];
            const slidesFromAlbum: ProjetoComTag[] = albumPhotos.map((projeto, index) => ({
              ...projeto,
              tagName,
              id: `${tagName}-${index}-${projeto.titulo}`,
            }));
            setSlides(slidesFromAlbum);
          } else if (mode === "fotos" || mode === "tags") {
            const allProjects: ProjetoComTag[] = Object.entries(projetos).flatMap(
              ([tagName, projetos]) =>
                projetos.map((projeto, index) => ({
                  ...projeto,
                  tagName,
                  id: `${tagName}-${index}-${projeto.titulo}`,
                }))
            );
            const shuffled = shuffleArray(allProjects).slice(0, 20);
            setSlides(shuffled);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading slides:", error);
        setIsLoading(false);
      }
    };
    loadSlides();
  }, [mode, photos, tagName]);

  const handleSlideChange = (swiper: SwiperType) => {
    const currentIndex = swiper.realIndex;
    setActiveIndex(currentIndex);
    
    const activeSlide = slides[currentIndex];
    if (!activeSlide) return;

    if ("foto" in activeSlide) {
      setCurrentTitle(activeSlide.tagName);
      if (onSlideChange) onSlideChange(activeSlide.foto);
    } else {
      setCurrentTitle(activeSlide.tagName || activeSlide.categoria || "");
      if (onSlideChange) onSlideChange(activeSlide);
    }
  };

  const handleClick = (project: ProjetoComTag | RandomizedTag, index: number) => {
    if (!modal) {
      if ("foto" in project) {
        if (onSlideClick) {
          onSlideClick(project.foto, index);
        } else {
          router.push(`/albuns/${encodeURIComponent(project.tagName)}`);
        }
      } else if (onSlideClick) {
        onSlideClick(project, index);
      } else if (project.categoria) {
        router.push(`/albuns/${encodeURIComponent(project.categoria)}`);
      }
    }
  };

  const containerClasses = modal
    ? "fixed inset-0 z-[9999] bg-black bg-opacity-95 flex items-center justify-center"
    : `relative w-full h-[calc(100vh-35px)] transition-all duration-300 ease-in-out`;

  return (
    <div id={`swiper-container-${tagName}`} className={containerClasses}>
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="loader"></div>
        </div>
      ) : slides.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-xl text-white">Nenhuma foto encontrada</div>
        </div>
      ) : (
        <>
          <Swiper
            modules={[Navigation, Autoplay, EffectFade, Keyboard, Pagination]}
            effect={mode === "fotos" || mode === "tags" ? "fade" : undefined}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={!hidePagination}
            keyboard={{ enabled: true }}
            autoplay={modal ? false : { delay: 5000, disableOnInteraction: true }}
            fadeEffect={{ crossFade: true }}
            loop={slides.length > 1}
            initialSlide={initialSlide}
            className={`swiper-container ${fullSize ? 'swiper-fullsize' : ''} ${modal ? 'modal' : ''} ${mode === 'albuns' ? 'swiper-container-albuns' : ''}`}
            onSlideChange={handleSlideChange}
          >
            {slides.map((slide, index) => {
              if (photos && mode === "albuns") {
                const projeto = slide as ProjetoComTag;
                
                return (
                  <SwiperSlide
                    key={projeto.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClick(projeto, index);
                    }}
                    className="cursor-pointer relative flex items-center justify-center"
                  >
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-md group">
                      <div className="relative w-full h-full">
                        <Image
                          src={projeto.imagem}
                          alt={projeto.titulo}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-contain"
                          priority={priority && index === 0}
                          quality={75}
                        />
                      </div>
                    </div>
                  </SwiperSlide>
                );
              } else if (!photos && mode === "albuns") {
                const randomizedTag = slide as RandomizedTag;
                if (!randomizedTag.foto || !randomizedTag.foto.imagem) return null;

                return (
                  <SwiperSlide
                    key={`${randomizedTag.tagName}-${index}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleClick(randomizedTag, index);
                    }}
                    className="cursor-pointer relative"
                  >
                    <div className="relative w-full h-full overflow-hidden rounded-md group">
                      <Image
                        src={randomizedTag.foto.imagem}
                        alt={randomizedTag.tagName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority={priority && index === 0}
                        quality={75}
                      />
                      {mode === "albuns" && !photos && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                      )}
                    </div>
                  </SwiperSlide>
                );
              } else {
                const projeto = slide as ProjetoComTag;
                if (!projeto || !projeto.imagem) return null;

                return (
                  <SwiperSlide
                    key={projeto.id}
                    className={`relative ${!modal && 'cursor-pointer'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!modal) {
                        handleClick(projeto, index);
                      }
                    }}
                  >
                    <div
                      className={
                        modal
                          ? "relative w-[90vw] h-full max-w-[1200px] flex items-center justify-center m-auto"
                          : fullSize
                          ? "relative w-full h-full flex items-center justify-center bg-black/5"
                          : "relative w-full h-full overflow-hidden rounded-md"
                      }
                    >
                      <Image
                        src={projeto.imagem}
                        alt={projeto.titulo}
                        fill
                        sizes={modal ? "80vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                        className={`${modal || fullSize ? "object-contain !p-4" : "object-cover"}`}
                        priority={priority && index === 0}
                        quality={75}
                      />
                    </div>
                  </SwiperSlide>
                );
              }
            })}
          </Swiper>
          {mode === "albuns" && !photos && !modal && currentTitle && isHomePage && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="max-w-[90%] md:max-w-3xl mx-auto">
                <TituloResponsivo className="text-white text-4xl md:text-6xl font-bold px-4 py-2 rounded-md text-center capitalize break-words bg-black/20">
                  {currentTitle.replace(/-/g, ' ')}
                </TituloResponsivo>
              </div>
            </div>
          )}
          {modal && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl z-[10000] transition-colors modal-close-button"
              aria-label="Fechar"
            >
              ✕
            </button>
          )}
        </>
      )}
    </div>
  );
}
