"use client";

import React, { Suspense, useCallback, useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, Autoplay } from "swiper/modules"; // EffectFade removido
import type { Swiper as SwiperType } from "swiper";
import "swiper/css/bundle";

import type { Projeto } from "@/types/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const TituloResponsivo = dynamic(() => import("./TituloResponsivo"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

type CustomSwiperProps = {
  mode: "albuns" | "fotos";
  photos: Projeto[];
  initialSlide?: number;
  modal?: boolean;
  onClose?: () => void;
  tagName?: string;
  hidePagination?: boolean;
  onSlideClick?: (projeto: Projeto, index: number) => void;
  fullSize?: boolean;
  priority?: boolean;
  onSlideChange?: (projeto: Projeto) => void;
};

const SwiperImage = React.memo(
  ({ src, alt, modal, fullSize, priority, index }: { src: string; alt: string; modal?: boolean; fullSize?: boolean; priority?: boolean; index: number; }) => (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={modal ? "80vw" : "100vw"}
      className={`${modal || fullSize ? "object-contain !p-4" : "object-cover"}`}
      priority={priority && index < 2}
      quality={modal ? 90 : 75}
      loading={index < 2 ? "eager" : "lazy"}
    />
  )
);
SwiperImage.displayName = "SwiperImage";

export default function CustomSwiper({
  mode,
  photos = [],
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
  const [currentTitle, setCurrentTitle] = useState("");

  const slides = photos;

  useEffect(() => {
    if (slides.length > 0) {
      const initialProject = slides[initialSlide];
      setCurrentTitle(initialProject?.titulo || initialProject?.albumName || "");
    }
  }, [slides, initialSlide]);

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const activeSlide = slides[swiper.realIndex];
      if (!activeSlide) return;

      setCurrentTitle(activeSlide.titulo || activeSlide.albumName || "");
      if (onSlideChange) {
        onSlideChange(activeSlide);
      }
    },
    [slides, onSlideChange]
  );

  const handleClick = useCallback(
    (project: Projeto, index: number) => {
      if (modal) return;

      if (onSlideClick) {
        onSlideClick(project, index);
      } else if (project.albumName) {
        router.push(`/albuns/${encodeURIComponent(project.albumName)}`);
      }
    },
    [modal, onSlideClick, router]
  );

  const containerClasses = useMemo(
    () => modal ? "fixed inset-0 z-[9999] bg-black bg-opacity-95 flex items-center justify-center h-screen w-full" : "relative w-full h-full",
    [modal]
  );

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-xl text-white">Carregando projetos...</div>
      </div>
    );
  }

  return (
    <div id={`swiper-container-${tagName}`} className={containerClasses}>
      <Suspense fallback={<div className="loader" />}>
        <Swiper
          modules={[Navigation, Keyboard, Autoplay]}
          // AQUI ESTÁ A CORREÇÃO PRINCIPAL: REMOVEMOS O 'effect'
          spaceBetween={0}
          slidesPerView={1}
          navigation={slides.length > 1}
          loop={slides.length > 1}
          initialSlide={initialSlide}
          keyboard={{ enabled: true }}
          autoplay={mode === 'albuns' ? { delay: 6000, disableOnInteraction: false } : false}
          className={`w-full h-full ${mode === 'albuns' ? 'swiper-homepage' : ''}`}
          onSlideChange={handleSlideChange}
        >
          {slides.map((slide, index) => (
            <SwiperSlide
              key={slide.id || `${slide.titulo}-${index}`}
              onClick={() => handleClick(slide, index)}
              className={`relative ${!modal && "cursor-pointer"}`}
            >
              <div className="relative w-full h-full">
                <SwiperImage
                  src={slide.imagem}
                  alt={slide.titulo}
                  modal={modal}
                  fullSize={fullSize}
                  priority={priority}
                  index={index}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {mode === 'albuns' && currentTitle && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-black bg-opacity-20">
            <TituloResponsivo className="text-white text-shadow-lg">
              {currentTitle.replace(/-/g, ' ')}
            </TituloResponsivo>
          </div>
        )}

        {modal && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl z-[10000] transition-colors"
            aria-label="Fechar"
          >
            ✕
          </button>
        )}
      </Suspense>
    </div>
  );
}
