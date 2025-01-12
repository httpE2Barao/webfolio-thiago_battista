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
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import data from "@/data/projetos.js";
import { shuffleArray } from "@/lib/shuffleArray";

// Tipos para os slides gerados a partir do modo random ou shuffle
type RandomizedAlbum = {
  categoria: string;
  foto: Projeto;
};

type ProjetoComAlbum = Projeto & {
  album: string;
};

// Props do componente
type CustomSwiperProps = {
  mode: "random" | "shuffle";
  photos?: Projeto[];      // Caso seja usado para exibir um álbum (passado via props)
  initialSlide?: number;   // Slide inicial (por exemplo, foto clicada no grid)
  modal?: boolean;         // Se true, renderiza com estilo de modal
  onClose?: () => void;    // Função para fechar o modal
  albumName?: string;      // Nome do álbum (se aplicável)
};

export default function CustomSwiper({
  mode,
  photos,
  initialSlide = 0,
  modal = false,
  onClose,
  albumName = "",
}: CustomSwiperProps) {
  const router = useRouter();
  const [slides, setSlides] = useState<RandomizedAlbum[] | ProjetoComAlbum[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<string>("");

  useEffect(() => {
    if (photos) {
      // Se a lista de fotos for passada, cria slides a partir dela
      const slidesFromPhotos: ProjetoComAlbum[] = photos.map((projeto) => ({
        ...projeto,
        album: albumName,
      }));
      setSlides(slidesFromPhotos);
      if (slidesFromPhotos.length > 0) {
        setCurrentAlbum(albumName);
      }
    } else {
      // Lógica original: busca dados a partir do módulo de dados
      const projetos: Projetos = data.projetos;
      if (mode === "random") {
        // Seleciona uma foto aleatória de cada álbum
        const randomized: RandomizedAlbum[] = Object.entries(projetos).map(
          ([categoria, fotos]) => ({
            categoria,
            foto: fotos[Math.floor(Math.random() * fotos.length)],
          })
        );
        setSlides(randomized);
        if (randomized.length > 0) {
          setCurrentAlbum(randomized[0].categoria);
        }
      } else if (mode === "shuffle") {
        // Embaralha todas as fotos de todos os álbuns
        const allProjects: ProjetoComAlbum[] = Object.entries(projetos).flatMap(
          ([album, projetos]) =>
            projetos.map((projeto) => ({ ...projeto, album }))
        );
        const shuffled = shuffleArray(allProjects);
        setSlides(shuffled);
        if (shuffled.length > 0) {
          setCurrentAlbum(shuffled[0].album);
        }
      }
    }
  }, [mode, photos, albumName]);

  const handleSlideChange = (swiper: SwiperType) => {
    const activeIndex = swiper.realIndex;
    const activeSlide = slides[activeIndex];
  
    // Verifica se activeSlide está definido
    if (!activeSlide) return;
  
    if (photos) {
      // Se as fotos foram passadas, o álbum permanece o mesmo
      setCurrentAlbum(albumName);
    } else {
      if (mode === "random" && "categoria" in activeSlide) {
        setCurrentAlbum(activeSlide.categoria);
      } else if (mode === "shuffle" && "album" in activeSlide) {
        setCurrentAlbum(activeSlide.album);
      }
    }
  };
  
  // Define as classes do contêiner de acordo com o modo modal
  const containerClasses = modal
    ? "fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
    : `relative w-full ${mode === "shuffle" ? "h-[50vh]" : "h-[calc(100vh-35px)]"}`;

  return (
    <div className={containerClasses}>
      {modal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl z-60"
          aria-label="Fechar"
        >
          &times;
        </button>
      )}

      {/* No modo não-modal e para o mode "shuffle", exibe o nome do álbum */}
      {mode === "shuffle" && !modal && (
        <div className="absolute top-5 w-full text-center z-10">
          <h1 className="text-5xl font-light text-white px-4 py-2 rounded-md">
            {currentAlbum}
          </h1>
        </div>
      )}

      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect={mode === "shuffle" ? "fade" : undefined}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: true }}
        fadeEffect={{ crossFade: true }}
        loop={true}
        initialSlide={initialSlide}
        className="w-full h-full"
        onSlideChange={handleSlideChange}
      >
        {slides.map((slide, index) => {
          // Se não foram passadas fotos (lógica original) e no modo "random"
          if (!photos && mode === "random") {
            const { categoria, foto } = slide as RandomizedAlbum;
            return (
              <SwiperSlide
                key={categoria}
                onClick={() => {
                  if (!modal)
                    router.push(`/albuns/${encodeURIComponent(categoria)}`);
                }}
                className="cursor-pointer relative"
              >
                <div className="relative w-full h-full overflow-hidden rounded-md">
                  <Image
                    src={foto.imagem}
                    alt={categoria}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h2 className="text-white text-responsive font-semibold capitalize">
                      {categoria}
                    </h2>
                  </div>
                </div>
              </SwiperSlide>
            );
          } else {
            // Para mode "shuffle" ou quando as fotos são passadas (usado no modal)
            const projeto = slide as ProjetoComAlbum;return (
              <SwiperSlide
                key={projeto.id + index}
                className={`relative flex items-center justify-center`}
              >
                <div
                  className={
                    modal
                      ? "relative w-[90vw] h-[90vh] max-w-[1200px] flex items-center justify-center m-auto"
                      : "relative w-full h-full overflow-hidden rounded-md"
                  }
                >
                  <Image
                    src={projeto.imagem}
                    alt={projeto.titulo}
                    fill // Usa o atributo "fill" para ajuste dinâmico no modal
                    sizes={modal ? "80vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"}
                    className={modal ? "object-contain" : "object-cover"}
                    priority
                  />
                </div>

                {/* Botão de fechar */}
                {modal && (
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-white text-black rounded-full p-4 text-2xl z-60 shadow-lg hover:bg-gray-100"
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
