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

// Tipos para as diferentes formas de slides
type RandomizedAlbum = {
  categoria: string;
  foto: Projeto;
};

type ProjetoComAlbum = Projeto & {
  album: string;
};

// Props para o componente CustomSwiper
type CustomSwiperProps = {
  mode: 'random' | 'shuffle';
};

export default function CustomSwiper({ mode }: CustomSwiperProps) {
  const router = useRouter();
  const [slides, setSlides] = useState<RandomizedAlbum[] | ProjetoComAlbum[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<string>('');

  useEffect(() => {
    const projetos: Projetos = data.projetos;

    if (mode === 'random') {
      // Seleciona uma foto aleatória de cada álbum
      const randomized: RandomizedAlbum[] = Object.entries(projetos).map(([categoria, fotos]) => ({
        categoria,
        foto: fotos[Math.floor(Math.random() * fotos.length)],
      }));
      setSlides(randomized);
      if (randomized.length > 0) {
        setCurrentAlbum(randomized[0].categoria);
      }
    } else if (mode === 'shuffle') {
      // Embaralha todas as fotos de todos os álbuns
      const allProjects: ProjetoComAlbum[] = Object.entries(projetos).flatMap(([album, projetos]) =>
        projetos.map((projeto) => ({ ...projeto, album }))
      );
      const shuffled = shuffleArray(allProjects);
      setSlides(shuffled);
      if (shuffled.length > 0) {
        setCurrentAlbum(shuffled[0].album);
      }
    }
  }, [mode]);

  const handleSlideChange = (swiper: SwiperType) => {
    const activeIndex = swiper.realIndex;
    const activeSlide = slides[activeIndex];
    if (mode === 'random' && 'categoria' in activeSlide) {
      setCurrentAlbum(activeSlide.categoria);
    } else if (mode === 'shuffle' && 'album' in activeSlide) {
      setCurrentAlbum(activeSlide.album);
    }
  };

  if (slides.length === 0) {
    return <div className="w-full h-[calc(100vh-35px)]" />;
  }

  return (
    <div className={`relative w-full ${mode === 'shuffle' ? 'h-[50vh]' : 'h-[calc(100vh-35px)]'}`}>
      {/* Mostrar o nome do álbum apenas no modo 'shuffle' */}
      {mode === 'shuffle' && (
        <div className="absolute top-5 w-full text-center z-10">
          <h1 className="text-5xl font-light text-white px-4 py-2 rounded-md">
            {currentAlbum}
          </h1>
        </div>
      )}

      {/* Swiper */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect={mode === 'shuffle' ? "fade" : undefined}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: true }}
        fadeEffect={{ crossFade: true }}
        loop={true}
        className="w-full h-full"
        onSlideChange={handleSlideChange}
      >
        {slides.map((slide) => {
          if (mode === 'random') {
            const { categoria, foto } = slide as RandomizedAlbum;
            return (
              <SwiperSlide
                key={categoria}
                onClick={() => router.push(`/albuns/${encodeURIComponent(categoria)}`)}
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
                    <h2 className="text-white text-6xl font-semibold capitalize">
                      {categoria}
                    </h2>
                  </div>
                </div>
              </SwiperSlide>
            );
          } else if (mode === 'shuffle') {
            const projeto = slide as ProjetoComAlbum;
            return (
              <SwiperSlide
                key={projeto.id}
                onClick={() => router.push(`/albuns/${encodeURIComponent(projeto.album)}`)}
                className="cursor-pointer relative"
              >
                <div className="relative w-full h-full overflow-hidden rounded-md">
                  <Image
                    src={projeto.imagem}
                    alt={projeto.titulo}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </SwiperSlide>
            );
          }
          return null;
        })}
      </Swiper>
    </div>
  );
}
