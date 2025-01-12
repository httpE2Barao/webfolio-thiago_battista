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
type RandomizedAlbum = {
  albumName: string;
  foto: Projeto;
};

type ProjetoComAlbum = Projeto & {
  albumName: string;
};

// Props do componente
type CustomSwiperProps = {
  mode: "random" | "shuffle";
  photos?: Projeto[]; // Caso seja usado para exibir um álbum (passado via props)
  initialSlide?: number; // Slide inicial (por exemplo, foto clicada no grid)
  modal?: boolean; // Se true, renderiza com estilo de modal
  onClose?: () => void; // Função para fechar o modal
  albumName?: string; // Nome do álbum (se aplicável)
  hidePagination?: boolean;
};

export default function CustomSwiper({
  mode,
  photos,
  initialSlide = 0,
  modal = false,
  onClose,
  albumName = "",
  hidePagination = false,
}: CustomSwiperProps) {
  const router = useRouter();
  const [slides, setSlides] = useState<RandomizedAlbum[] | ProjetoComAlbum[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<string>("");

  useEffect(() => {
    if (photos) {
      // Cria slides a partir das fotos passadas via props
      const slidesFromPhotos: ProjetoComAlbum[] = photos.map((projeto, index) => ({
        ...projeto,
        albumName,
        id: `${albumName}-${index}-${projeto.titulo}`, // Gera uma chave única para cada projeto
      }));
      setSlides(slidesFromPhotos);
      if (slidesFromPhotos.length > 0) {
        setCurrentAlbum(albumName);
      }
    } else {
      // Lógica original: busca dados do módulo de dados
      const projetos: Projetos = data.projetos;
      if (mode === "random") {
        // Seleciona uma foto aleatória de cada álbum
        const randomized: RandomizedAlbum[] = Object.entries(projetos).map(
          ([albumName, fotos]) => ({
            albumName,
            foto: fotos[Math.floor(Math.random() * fotos.length)],
          })
        );
        setSlides(randomized);
        if (randomized.length > 0) {
          setCurrentAlbum(randomized[0].albumName);
        }
      } else if (mode === "shuffle") {
        // Embaralha todas as fotos de todos os álbuns
        const allProjects: ProjetoComAlbum[] = Object.entries(projetos).flatMap(
          ([albumName, projetos]) =>
            projetos.map((projeto, index) => ({
              ...projeto,
              albumName,
              id: `${albumName}-${index}-${projeto.titulo}`, // Gera uma chave única para cada projeto
            }))
        );
        const shuffled = shuffleArray(allProjects);
        setSlides(shuffled);
        if (shuffled.length > 0) {
          setCurrentAlbum(shuffled[0].albumName);
        }
      }
    }
  }, [mode, photos, albumName]);

  const handleSlideChange = (swiper: SwiperType) => {
    const activeIndex = swiper.realIndex;
    const activeSlide = slides[activeIndex];

    if (!activeSlide) return;

    if (photos) {
      setCurrentAlbum(albumName);
    } else {
      if (mode === "random" && "albumName" in activeSlide) {
        setCurrentAlbum(activeSlide.albumName);
      } else if (mode === "shuffle" && "albumName" in activeSlide) {
        setCurrentAlbum(activeSlide.albumName);
      }
    }
  };

  // Define as classes do contêiner de acordo com o modo modal
  const containerClasses = modal
    ? "fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
    : `relative w-full ${mode === "shuffle" ? "h-[50vh]" : "h-[calc(100vh-35px)]"}`;

  return (
    <div className={containerClasses}>
      {/* No modo não-modal e para o mode "shuffle", exibe o nome do álbum */}
      {mode === "shuffle" && !modal && (
        <div className="absolute bottom-5 w-full text-center z-10">
          <h1 className="text-5xl font-light text-white px-4 py-2 rounded-md">
            {currentAlbum}
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
            const { albumName, foto } = slide as RandomizedAlbum;
            const key = `${slide.albumName}-${index}`; // Garante chaves únicas
            return (
              <SwiperSlide
                key={key}
                onClick={() => {
                  if (!modal) router.push(`/albuns/${encodeURIComponent(albumName)}`);
                }}
                className="cursor-pointer relative"
              >
                <div className="relative w-full h-full overflow-hidden rounded-md">
                  <Image
                    src={foto.imagem}
                    alt={albumName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h2 className="text-white text-responsive font-semibold capitalize">
                      {albumName}
                    </h2>
                  </div>
                </div>
              </SwiperSlide>
            );
          } else {
            const projeto = slide as ProjetoComAlbum;
            return (
              <SwiperSlide
                key={projeto.id}
                className="relative flex items-center justify-center"
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