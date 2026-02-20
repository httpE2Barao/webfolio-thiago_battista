"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css/bundle";
import "swiper/css/navigation";
import "swiper/css/zoom";
import { Autoplay, EffectCards, Keyboard, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { getFullscreenUrl, getSwiperUrl } from "@/lib/cloudinaryOptimize";
import type { Projeto } from "@/types/types";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiChevronLeft, FiChevronRight, FiMessageCircle, FiShare2, FiZoomIn, FiZoomOut } from "react-icons/fi";
import CommentSystem from "./CommentSystem";
import ReactionButtons from "./ReactionButtons";

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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Selection logic:
    // ... same as before ...
    let finalSrc = src;
    if (isMobile && coverImageMobile) {
      finalSrc = coverImageMobile;
    } else if (!isMobile && coverImageDesktop) {
      finalSrc = coverImageDesktop;
    }

    const optimizedSrc = modal || fullSize
      ? getFullscreenUrl(finalSrc, withWatermark)
      : getSwiperUrl(finalSrc, withWatermark);

    return (
      <div className="swiper-zoom-container w-full h-full relative">
        <AnimatePresence>
          {isLoading && (modal || fullSize) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-10"
            >
              <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
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
          onLoadingComplete={() => setIsLoading(false)}
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
  const [showComments, setShowComments] = useState(false);
  const [commentLayout, setCommentLayout] = useState<"floating" | "sidebar">("floating");
  const swiperRef = useRef<SwiperType | null>(null);
  const [navVisible, setNavVisible] = useState(false);

  // Extract just the short unique photo ID (last path segment) for API calls
  const getPhotoId = (fullId: string) => fullId.includes('/') ? fullId.split('/').pop() ?? fullId : fullId;

  // Handle browser back button to close comments on mobile
  useEffect(() => {
    const handlePopState = () => {
      if (showComments) {
        setShowComments(false);
      }
    };

    if (showComments) {
      window.history.pushState({ commentsOpen: true }, "");
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [showComments]);

  const slides = photos;

  useEffect(() => {
    if (slides.length > 0) {
      const initialProject = slides[initialSlide];
      setCurrentTitle(initialProject?.titulo || initialProject?.albumName || "");
      setCurrentCategory(initialProject?.categoria || "");
    }
  }, [slides, initialSlide]);

  // Stabilize swiper on sidebar change
  useEffect(() => {
    if (swiperRef.current) {
      setTimeout(() => {
        swiperRef.current?.update();
      }, 100);
    }
  }, [showComments, commentLayout]);

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

      // Update URL with photo ID for sharing/deep-linking
      if (modal && activeSlide.id) {
        const url = new URL(window.location.href);
        // Remove redundant folder segments (e.g., from Cloudinary paths)
        const photoId = activeSlide.id.includes('/')
          ? activeSlide.id.split('/').pop()
          : activeSlide.id;
        url.searchParams.set('img', photoId || "");
        window.history.replaceState({}, '', url.toString());
      }

      if (onSlideChange) {
        onSlideChange(activeSlide);
      }
    },
    [slides, onSlideChange, modal]
  );

  // Cleanup effect for URL param when closing modal
  useEffect(() => {
    if (modal) {
      return () => {
        const url = new URL(window.location.href);
        if (url.searchParams.has('img')) {
          url.searchParams.delete('img');
          window.history.replaceState({}, '', url.toString());
        }
      };
    }
  }, [modal]);

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
  const swiperModules = [Keyboard];
  if (modal) swiperModules.push(Zoom);
  else {
    swiperModules.push(Autoplay);
  }

  if (effect === 'cards') swiperModules.push(EffectCards);

  return (
    <div
      id={`swiper-container-${swiperId}`}
      className={containerClasses}
      onMouseEnter={() => !modal && setNavVisible(true)}
      onMouseLeave={() => setNavVisible(false)}
    >

      <Suspense fallback={<div className="loader" />}>
        <div className={`relative w-full h-full flex ${showComments && commentLayout === 'sidebar' ? 'md:pr-80' : ''} ${!modal ? 'swiper-nav-container' : 'modal-swiper'}`}>
          <Swiper
            modules={swiperModules}
            spaceBetween={0}
            slidesPerView={1}
            navigation={false}
            loop={slides.length > 1}
            initialSlide={initialSlide}
            keyboard={{ enabled: true, onlyInViewport: true }}
            autoplay={mode === 'albuns' && !modal && effect !== 'cards' ? { delay: 6000, disableOnInteraction: false } : false}
            zoom={modal ? { maxRatio: 3, minRatio: 1 } : false}
            effect={effect}
            grabCursor={effect === 'cards'}
            watchSlidesProgress={true}
            observer={true}
            observeParents={true}
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
                    className={`absolute z-30 ${mode === 'albuns' ? 'inset-x-16 inset-y-0' : 'inset-x-[20%] inset-y-0'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick(slide, index);
                    }}
                    title="Ver álbum completo"
                  />
                )}
                <div
                  className="relative w-full h-full"
                  onClick={(e) => {
                    if (modal && !isZoomed) {
                      handleClick(slide, index);
                    }
                  }}
                >
                  <SwiperImage
                    src={slide.imagem}
                    alt={slide.titulo}
                    modal={modal}
                    fullSize={fullSize}
                    priority={priority}
                    index={index}
                    withWatermark={mode === 'fotos'}
                    coverImageMobile={slide.coverImageMobile}
                    coverImageDesktop={slide.coverImageDesktop}
                    coverImageMobilePosition={slide.coverImageMobilePosition}
                    coverImageDesktopPosition={slide.coverImageDesktopPosition}
                  />
                </div>
              </SwiperSlide>
            ))}

            {/* Custom navigation arrows — hidden in modal/mobile */}
          </Swiper>

          {/* Custom navigation arrows — only in albums mode */}
          {!modal && mode === 'albuns' && slides.length > 1 && (
            <>
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                aria-label="Anterior"
                className="swiper-arrow-btn swiper-arrow-prev"
                style={{
                  position: 'fixed',
                  left: isMobile ? 12 : 176 + 12, // desktop: após o sidenav (w-44 = 176px)
                  top: isMobile ? '70%' : '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 9999,
                  width: isMobile ? 38 : 44,
                  height: isMobile ? 38 : 44,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: navVisible ? 1 : 0,
                  transition: 'opacity 0.25s ease, transform 0.2s ease',
                  pointerEvents: navVisible ? 'auto' : 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                }}
              >
                <FiChevronLeft size={isMobile ? 18 : 22} />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                aria-label="Próximo"
                className="swiper-arrow-btn swiper-arrow-next"
                style={{
                  position: 'fixed',
                  right: 16,
                  top: isMobile ? '70%' : '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 9999,
                  width: isMobile ? 38 : 44,
                  height: isMobile ? 38 : 44,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: navVisible ? 1 : 0,
                  transition: 'opacity 0.25s ease, transform 0.2s ease',
                  pointerEvents: navVisible ? 'auto' : 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                }}
              >
                <FiChevronRight size={isMobile ? 18 : 22} />
              </button>
            </>
          )}
        </div>

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
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-[10px] md:text-sm z-[10000] whitespace-nowrap">
                Arraste para mover • Clique no + para sair do zoom
              </div>
            )}

            {/* Image counter (Hidden on Mobile) */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-[10000] hidden md:block">
              {activeIndex + 1} / {slides.length}
            </div>

            {/* Custom Sliding Pagination Dots for All Screens */}
            {!isZoomed && slides.length > 1 && (
              <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 z-[10000] flex items-center justify-center h-8 transition-all duration-500 ${showComments && commentLayout === 'sidebar' ? 'md:-translate-x-[calc(50%+160px)]' : ''}`}>
                <div className="relative overflow-hidden px-4 h-full flex items-center bg-black/20 backdrop-blur-md rounded-full border border-white/5" style={{ width: '120px' }}>
                  <motion.div
                    className="flex items-center gap-2"
                    animate={{
                      x: slides.length <= 5
                        ? 0
                        : -(Math.max(0, Math.min(activeIndex - 2, slides.length - 5)) * 14) // 14px = 6px (w-1.5) + 8px (gap-2) approx
                    }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  >
                    {slides.map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          width: i === activeIndex ? 16 : 6,
                          height: 6,
                          backgroundColor: i === activeIndex ? "rgba(59, 130, 246, 1)" : "rgba(255, 255, 255, 0.3)"
                        }}
                        transition={{ duration: 0.3 }}
                        className="rounded-full flex-shrink-0"
                      />
                    ))}
                  </motion.div>
                </div>
              </div>
            )}

            {!isZoomed && (
              <div className="absolute inset-0 pointer-events-none z-[10002]">
                {/* Floating Comments View (Stream of last 3) */}
                {commentLayout === "floating" && (
                  <div className="absolute bottom-11 left-4 right-16 md:left-1/2 md:right-auto md:-translate-x-1/2 w-auto md:w-full md:max-w-lg px-0 md:px-6 flex flex-col items-start md:items-center gap-4 transition-all duration-500">
                    <CommentSystem
                      imageId={getPhotoId(slides[activeIndex]?.id || "")}
                      layout="floating"
                      isOpen={true} // Always open stream if in floating layout
                      onSwitchLayout={() => {
                        setCommentLayout("sidebar");
                        setShowComments(true);
                      }}
                    />
                  </div>
                )}

                {/* Vertical Interaction Sidebar (Now bottom-right) */}
                <div className={`absolute right-4 md:right-6 bottom-4 flex flex-col items-center gap-3 md:gap-4 pointer-events-auto transition-all duration-500 ${showComments && commentLayout === 'sidebar' ? 'md:mr-80' : ''}`}>

                  <ReactionButtons
                    imageId={getPhotoId(slides[activeIndex]?.id || "")}
                    onReact={() => { }}
                  />

                  <div className="flex flex-col gap-3 md:gap-4">
                    <button
                      onClick={() => {
                        if (showComments && commentLayout === 'sidebar') {
                          setShowComments(false);
                        } else {
                          setCommentLayout("sidebar");
                          setShowComments(true);
                        }
                      }}
                      className={`p-3 md:p-4 rounded-full backdrop-blur-md transition-all shadow-xl border border-white/5 ${showComments && commentLayout === 'sidebar' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      title="Abrir Conversa"
                    >
                      <FiMessageCircle size={typeof window !== 'undefined' && window.innerWidth > 768 ? 28 : 22} />
                    </button>

                    <button
                      onClick={() => {
                        const url = typeof window !== 'undefined' ? window.location.href : '';
                        navigator.clipboard.writeText(url);
                        alert("Link copiado!");
                      }}
                      className="p-3 md:p-4 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all shadow-xl border border-white/5"
                      title="Compartilhar"
                    >
                      <FiShare2 size={typeof window !== 'undefined' && window.innerWidth > 768 ? 28 : 22} />
                    </button>
                  </div>
                </div>

                {/* Sidebar/Bottom Drawer Comments */}
                {commentLayout === "sidebar" && (
                  <CommentSystem
                    imageId={getPhotoId(slides[activeIndex]?.id || "")}
                    layout="sidebar"
                    isOpen={showComments}
                    onClose={() => {
                      setShowComments(false);
                      // Restore floating layout when closing sidebar
                      setCommentLayout("floating");
                    }}
                  />
                )}
              </div>
            )}
          </>
        )}
      </Suspense>
    </div>
  );
}
