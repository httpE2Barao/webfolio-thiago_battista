"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css/bundle";
import "swiper/css/zoom";
import { Autoplay, EffectCards, Keyboard, Navigation, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { getFullscreenUrl, getSwiperUrl } from "@/lib/cloudinaryOptimize";
import type { Projeto } from "@/types/types";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiZoomIn, FiZoomOut } from "react-icons/fi";

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
  effect?: "slide" | "fade" | "cards";
};

interface SwiperImageProps {
  src: string;
  alt: string;
  modal?: boolean;
  fullSize?: boolean;
  priority?: boolean;
  index: number;
  withWatermark?: boolean;
  coverImageMobile?: string;
  coverImageDesktop?: string;
  coverImageMobilePosition?: string;
  coverImageDesktopPosition?: string;
}

const SwiperImage = React.memo(
  ({ src, alt, modal, fullSize, priority, index, withWatermark, coverImageMobile, coverImageDesktop, coverImageMobilePosition, coverImageDesktopPosition }: SwiperImageProps) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Selection logic:
    // 1. If mobile and coverImageMobile exists, use it.
    // 2. If desktop and coverImageDesktop exists, use it.
    // 3. Fallback to default src.
    let finalSrc = src;
    if (isMobile && coverImageMobile) {
      finalSrc = coverImageMobile;
    } else if (!isMobile && coverImageDesktop) {
      finalSrc = coverImageDesktop;
    }

    // Use optimized URL based on context:
    const optimizedSrc = modal || fullSize
      ? getFullscreenUrl(finalSrc, withWatermark)
      : getSwiperUrl(finalSrc, withWatermark);

    return (
      <div className="swiper-zoom-container w-full h-full relative">
        <Image
          src={optimizedSrc}
          alt={alt}
          fill
          sizes={modal ? "100vw" : "(max-width: 768px) 100vw, (max-width: 1920px) 100vw, 1920px"}
          className={modal || fullSize ? "!object-contain" : "!object-cover"}
          style={{
            objectPosition: isMobile
              ? (coverImageMobilePosition || "center")
              : (coverImageDesktopPosition || "center")
          }}
          priority={priority && index < 2}
          quality={90}
          loading={index < 2 ? "eager" : "lazy"}
        />
      </div>
    );
  }
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
  effect = "slide",
}: CustomSwiperProps) {
  const router = useRouter();
  const reactId = React.useId();
  const swiperId = useMemo(() => {
    const cleanTagName = (tagName || '').replace(/\s+/g, '-').toLowerCase();
    if (cleanTagName) return cleanTagName;
    // useId in React 18+ returns strings like ":r1:", we sanitize for CSS classes
    return reactId.replace(/:/g, '');
  }, [tagName, reactId]);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [activeIndex, setActiveIndex] = useState(initialSlide);
  const [isZoomed, setIsZoomed] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  const slides = photos;

  useEffect(() => {
    if (slides.length > 0) {
      const initialProject = slides[initialSlide];
      setCurrentTitle(initialProject?.titulo || initialProject?.albumName || "");
      setCurrentCategory(initialProject?.categoria || "");
    }
  }, [slides, initialSlide]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!modal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal, onClose]);

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const activeSlide = slides[swiper.realIndex];
      if (!activeSlide) return;

      setActiveIndex(swiper.realIndex);
      setCurrentTitle(activeSlide.titulo || activeSlide.albumName || "");
      setCurrentCategory(activeSlide.categoria || "");
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
      } else if (project.id) {
        router.push(`/albuns/${encodeURIComponent(project.id)}`);
      } else if (project.albumName) {
        router.push(`/albuns/${encodeURIComponent(project.albumName)}`);
      }
    },
    [modal, onSlideClick, router]
  );

  const handleZoomChange = useCallback((swiper: SwiperType, scale: number) => {
    setIsZoomed(scale > 1);
  }, []);

  const toggleZoom = useCallback(() => {
    if (swiperRef.current?.zoom) {
      if (isZoomed) {
        swiperRef.current.zoom.out();
      } else {
        swiperRef.current.zoom.in();
      }
    }
  }, [isZoomed]);

  const containerClasses = useMemo(
    () => modal ? "fixed inset-0 z-[9999] bg-black flex items-center justify-center h-screen w-full" : "relative w-full h-full",
    [modal]
  );

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (slides.length === 0) {
    console.warn(`Swiper [${tagName}] não possui slides para exibir.`);
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl border border-white/5 min-h-[300px]">
        <div className="text-white/30 text-sm font-medium uppercase tracking-widest">Nenhuma foto encontrada</div>
        {tagName && <div className="text-white/10 text-[10px] mt-2">Tag: {tagName}</div>}
      </div>
    );
  }

  // Determine which modules to use
  const swiperModules = [Navigation, Keyboard];
  if (modal) swiperModules.push(Zoom);
  else swiperModules.push(Autoplay);

  if (effect === 'cards') swiperModules.push(EffectCards);

  return (
    <div id={`swiper-container-${swiperId}`} className={containerClasses}>
      <Suspense fallback={<div className="loader" />}>
        <Swiper
          modules={swiperModules}
          spaceBetween={0}
          slidesPerView={1}
          navigation={slides.length > 1 && !isZoomed ? {
            nextEl: `.next-${swiperId}`,
            prevEl: `.prev-${swiperId}`,
          } : false}
          loop={slides.length > 1}
          initialSlide={initialSlide}
          keyboard={{ enabled: true, onlyInViewport: true }}
          autoplay={mode === 'albuns' && !modal && effect !== 'cards' ? { delay: 6000, disableOnInteraction: false } : false}
          zoom={modal ? { maxRatio: 3, minRatio: 1 } : false}
          effect={effect}
          grabCursor={effect === 'cards'}
          watchSlidesProgress={true}
          cardsEffect={{
            slideShadows: true,
            rotate: true,
            perSlideRotate: isMobile ? 8 : 15,
            perSlideOffset: isMobile ? 30 : 50,
          }}
          className={`w-full h-full swiper-modern-nav ${mode === 'albuns' ? 'swiper-homepage' : ''} ${effect === 'cards' ? 'swiper-cards-mode' : ''}`}
          onSlideChange={handleSlideChange}
          onZoomChange={handleZoomChange}
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          onClick={(swiper, event) => {
            if (!isMobile || isZoomed) return;

            // Get click position relative to swiper
            const rect = swiper.el.getBoundingClientRect();

            // Suporte para mouse e touch events
            const clientX = (event as any).clientX !== undefined
              ? (event as any).clientX
              : ((event as any).changedTouches && (event as any).changedTouches[0]?.clientX);

            if (clientX === undefined) return;

            const clickX = clientX - rect.left;
            const threshold = rect.width * 0.25;

            if (clickX < threshold) {
              swiper.slidePrev();
            } else if (clickX > rect.width - threshold) {
              swiper.slideNext();
            } else if (!modal) {
              // Click in the middle (50%) - Open album/photo
              const activeSlide = slides[swiper.realIndex];
              if (activeSlide) {
                handleClick(activeSlide, swiper.realIndex);
              }
            }
          }}
        >
          {slides.map((slide, index) => (
            <SwiperSlide
              key={slide.id || `${slide.titulo}-${index}`}
              className={`relative ${!modal && "cursor-pointer"}`}
            >
              {/* Área central clicável para entrar no álbum */}
              {((mode === 'fotos' && !modal) || (mode === 'albuns')) && !isZoomed && !isMobile && (
                <div
                  className={`absolute z-30 ${mode === 'albuns' ? 'inset-0' : 'inset-x-[20%] inset-y-0'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick(slide, index);
                  }}
                  title="Ver álbum completo"
                />
              )}
              <div
                className="relative w-full h-full"
                onClick={() => modal && !isZoomed && handleClick(slide, index)} // Mantém clique global apenas no modal
              >
                <SwiperImage
                  src={slide.imagem}
                  alt={slide.titulo}
                  modal={modal}
                  fullSize={fullSize}
                  priority={priority}
                  index={index}
                  withWatermark={mode === 'fotos'} // Protege fotos individuais
                  coverImageMobile={slide.coverImageMobile}
                  coverImageDesktop={slide.coverImageDesktop}
                  coverImageMobilePosition={slide.coverImageMobilePosition}
                  coverImageDesktopPosition={slide.coverImageDesktopPosition}
                />
              </div>
            </SwiperSlide>
          ))}

          {slides.length > 1 && !isZoomed && (
            <>
              <div className={`swiper-button-prev swiper-button-prev-${swiperId} prev-${swiperId}`}></div>
              <div className={`swiper-button-next swiper-button-next-${swiperId} next-${swiperId}`}></div>
            </>
          )}
        </Swiper>

        {mode === 'albuns' && currentTitle && !modal && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none bg-black/10">
            <div className="flex flex-col items-center justify-center gap-2 w-full max-w-[95%] px-6 text-center">
              <TituloResponsivo className="text-white text-shadow-lg !mb-0 text-center break-words w-full">
                {currentTitle.replace(/-/g, ' ')}
              </TituloResponsivo>

              {currentCategory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/albuns/categoria/${encodeURIComponent(currentCategory)}`);
                  }}
                  className="pointer-events-auto group flex flex-col items-center max-w-full px-4"
                >
                  <span className="text-white/60 text-sm md:text-lg uppercase tracking-[0.3em] font-black group-hover:text-white transition-colors duration-300 text-center">
                    {currentCategory}
                  </span>
                  <div className="h-[1px] w-0 bg-white group-hover:w-full transition-all duration-500" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal controls */}
        {modal && (
          <>
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl z-[10000] transition-colors"
              aria-label="Fechar"
            >
              ✕
            </button>

            {/* Zoom toggle button */}
            <button
              onClick={toggleZoom}
              className="absolute top-4 right-16 bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg z-[10000] transition-colors"
              aria-label={isZoomed ? "Reduzir zoom" : "Aumentar zoom"}
            >
              {isZoomed ? <FiZoomOut /> : <FiZoomIn />}
            </button>

            {/* Zoom indicator */}
            {isZoomed && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-[10000]">
                Arraste para mover • Clique no + para sair do zoom
              </div>
            )}

            {/* Image counter */}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-[10000]">
              {activeIndex + 1} / {slides.length}
            </div>
          </>
        )}
      </Suspense>
    </div>
  );
}
