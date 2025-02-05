"use client";

import { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Projeto, Projetos } from "@/data/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
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
}: CustomSwiperProps) {
  const router = useRouter();
  const [slides, setSlides] = useState<RandomizedTag[] | ProjetoComTag[]>([]);
  const [loading] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState(initialSlide);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log('CustomSwiper Props:', {
      mode,
      photos,
      tagName,
      modal
    });

    if (photos) {
      console.log('Photos recebidas:', photos);
      const slidesFromPhotos: ProjetoComTag[] = photos.map((projeto, index) => ({
        ...projeto,
        tagName: projeto.categoria || tagName,
        id: `${tagName}-${index}-${projeto.titulo}`,
      }));
      console.log('Slides gerados de photos:', slidesFromPhotos);
      setSlides(slidesFromPhotos);
    } else {
      const projetos: Projetos = data.projetos;
      if (mode === "albuns") {
        console.log("Modo álbuns - Projetos recebidos:", projetos);
        const randomized: RandomizedTag[] = shuffleArray(
          Object.entries(projetos).map(([albumName, fotos]) => {
            console.log(`Processando álbum: ${albumName}, fotos:`, fotos);
            if (fotos && fotos.length > 0) {
              const selectedPhoto = fotos[0];
              return {
                tagName: albumName,
                foto: selectedPhoto,
              };
            }
            return null;
          })
        )
        .filter((item): item is RandomizedTag => item !== null)
        .slice(0, 20);

        console.log("Slides randomizados gerados:", randomized);
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
              id: `${tagName}-${index}-${projeto.titulo}`, // Gera uma chave única para cada projeto
            }))
        );
        const shuffled = shuffleArray(allProjects).slice(0, 20); // Limitar a 20 fotos
        setSlides(shuffled);
      }
    }
  }, [mode, photos, tagName]);

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modal]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '50px',
      }
    );

    const element = document.getElementById(`swiper-container-${tagName}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [tagName]);

  const visibleSlides = useMemo(() => {
    if (!slides.length) return [];
    const start = Math.max(0, activeIndex - 1);
    const end = Math.min(slides.length, activeIndex + 2);
    return slides.slice(start, end);
  }, [slides, activeIndex]);

  const handleSlideChange = (swiper: SwiperType) => {
    const activeIndex = swiper.realIndex;
    const activeSlide = slides[activeIndex];

    if (!activeSlide) return;

    if (photos) {
      // No need to set currentTag here
    } else {
      if (mode === "albuns" && "tagName" in activeSlide) {
        // No need to set currentTag here
      } else if ((mode === "fotos" || mode === "tags") && "tagName" in activeSlide) {
        // No need to set currentTag here
      }
    }
  };

  const handleClick = (tagName: string) => {
    console.log('handleClick chamado com tagName:', tagName);
    if (!modal) {
      const url = `/albuns/${encodeURIComponent(tagName)}`;
      console.log('Navegando para:', url);
      router.push(url);
    }
  };

  const containerClasses = modal
    ? "fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
    : `relative w-full h-full transition-all duration-300 ease-in-out ${
        fullSize 
          ? "h-full" 
          : !photos 
            ? "h-[calc(100vh-35px)]" 
            : "group-hover:!h-[35vh] !h-[25vh]"
      }`;

  return (
    <div id={`swiper-container-${tagName}`} className={containerClasses}>
      {loading && slides.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-xl">Carregando...</div>
        </div>
      ) : slides.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-xl">Nenhuma foto encontrada</div>
        </div>
      ) : (
        <Swiper
          modules={[Navigation, Autoplay, EffectFade, Keyboard, ...(hidePagination ? [] : [Pagination])]}
          effect={mode === "fotos" || mode === "tags" ? "fade" : undefined}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={!hidePagination ? { clickable: true } : undefined}
          keyboard={{ enabled: true }}
          autoplay={{ delay: 5000, disableOnInteraction: true }}
          fadeEffect={{ crossFade: true }}
          loop={slides.length > 1}
          initialSlide={initialSlide}
          className={`w-full h-full ${fullSize ? 'swiper-fullsize' : ''}`}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
            handleSlideChange(swiper);
          }}
        >
          {(isVisible || priority ? slides : visibleSlides).map((slide, index) => {
            if (photos && mode === "albuns") {
              const projeto = slide as ProjetoComTag;
              
              return (
                <SwiperSlide
                  key={projeto.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Clique em slide com photos:', projeto);
                    if (!modal && projeto.categoria) {
                      const url = `/albuns/${encodeURIComponent(projeto.categoria)}`;
                      console.log('Navegando para:', url);
                      router.push(url);
                    }
                  }}
                  className="cursor-pointer relative"
                >
                  <div className="relative w-full h-full overflow-hidden rounded-md group">
                    <div className="swiper-lazy-preloader"></div>
                    <Image
                      src={projeto.imagem}
                      alt={projeto.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority={priority && index === 0}
                      loading="lazy"
                      quality={75}
                    />
                  </div>
                </SwiperSlide>
              );
            } else if (!photos && mode === "albuns") {
              const { tagName, foto } = slide as RandomizedTag;

              if (!foto || !foto.imagem) {
                console.log(`Invalid slide data at index ${index}:`, slide);
                return null;
              }

              const key = `${tagName}-${index}`;
              return (
                <SwiperSlide
                  key={key}
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Slide clicado - tagName:', tagName);
                    handleClick(tagName);
                  }}
                  className="cursor-pointer relative"
                >
                  <div className="relative w-full h-full overflow-hidden rounded-md group">
                    <div className="swiper-lazy-preloader"></div>
                    <Image
                      src={foto.imagem}
                      alt={tagName}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority={priority && index === 0}
                      loading="lazy"
                      quality={75}
                    />
                  </div>
                </SwiperSlide>
              );
            } else {
              const projeto = slide as ProjetoComTag;

              if (!projeto || !projeto.imagem) {
                console.error(`Invalid project data at index ${index}:`, slide);
                return null;
              }

              return (
                <SwiperSlide
                  key={projeto.id}
                  className="relative flex items-center justify-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSlideClick) {
                      onSlideClick(projeto, index);
                    }
                  }}
                >
                  <div
                    className={
                      modal
                        ? "relative w-[90vw] h-full max-w-[1200px] flex items-center justify-center m-auto"
                        : fullSize
                          ? "relative w-full h-full flex items-center justify-center"
                          : "relative w-full h-full overflow-hidden rounded-md"
                    }
                  >
                    {loading && modal && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="loader"></div>
                      </div>
                    )}
                    <div className="swiper-lazy-preloader"></div>
                    <Image
                      src={projeto.imagem}
                      alt={projeto.titulo}
                      fill
                      sizes={modal ? "80vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"}
                      className={`${modal || fullSize ? "object-contain" : "object-cover"}`}
                      priority={priority && index === 0}
                      loading="lazy"
                      quality={75}
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
      )}
    </div>
  );
}
