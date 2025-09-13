"use client";

import React, { Suspense, useCallback, useMemo, useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, Zoom } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css/bundle";

import type { Projeto, Projetos, RandomizedTag, ProjetoComTag } from "@/types/types";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { projetos as data, loadProjetosFromDB } from "@/data/projetos-db";
import { shuffleArray } from "@/lib/shuffleArray";
import { OptimizedImage, useImagePreloader, preloadCriticalImages } from "@/components/OptimizedImage";
import { useImageCacheManager } from "@/hooks/useImageCache";

// Importação dinâmica do componente TituloResponsivo
const TituloResponsivo = dynamic(() => import("./TituloResponsivo"), {
  ssr: false,
  loading: () => <div className="h-16" />,
});

// Props type definition
type CustomSwiperProps = {
  mode: "albuns" | "fotos" | "tags";
  photos?: Projeto[];
  initialSlide?: number;
  modal?: boolean;
  onClose?: () => void;
  tagName?: string;
  hidePagination?: boolean;
  onSlideClick?: (projeto: Projeto, index: number) => void;
  fullSize?: boolean;
  priority?: boolean;
  onSlideChange?: (projeto: Projeto) => void;
  onAlbumChange?: (albumName: string, category: string) => void;
};

const isRandomizedTag = (item: unknown): item is RandomizedTag =>
  item !== null &&
  typeof item === "object" &&
  "tagName" in item &&
  "foto" in item &&
  item.foto !== null &&
  typeof item.foto === "object" &&
  "id" in item.foto;

// Componente memoizado para a imagem
const SwiperImage = React.memo(
  ({
    src,
    alt,
    modal,
    fullSize,
    priority,
    index,
    mode,
  }: {
    src: string;
    alt: string;
    modal?: boolean;
    fullSize?: boolean;
    priority?: boolean;
    index: number;
    mode?: "albuns" | "fotos" | "tags";
  }) => (
    <OptimizedImage
      src={src}
      alt={alt}
      width={modal ? 1200 : 800}
      height={modal ? 1200 : mode === "fotos" ? 800 : 600}
      className={`${modal || fullSize ? "object-contain !p-4" : "object-cover"}`}
      priority={priority && index === 0}
      quality={modal ? 100 : 80}
      sizes={
        modal
          ? "80vw"
          : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      }
    />
  )
);
SwiperImage.displayName = "SwiperImage";

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
  onAlbumChange,
}: CustomSwiperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [slides, setSlides] = useState<RandomizedTag[] | ProjetoComTag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTitle, setCurrentTitle] = useState("");
  const isHomePage = pathname === "/";
  const { preloadImages } = useImageCacheManager();

  // Atualizado para trabalhar com a nova estrutura de Projetos (álbuns com "imagens")
  const loadSlides = useCallback(() => {
    if (photos) {
      setSlides(
        photos.map((projeto, index) => ({
          ...projeto,
          tagName: projeto.categoria || tagName,
          id: `${tagName}-${index}-${projeto.titulo}`,
        }))
      );
      return;
    }

    const projetosData = data as unknown as Projetos;

    if (mode === "albuns") {
      const randomized = shuffleArray(
        Object.entries(projetosData)
          .map(([albumName, album]) => {
            if (!album || !album.imagens || album.imagens.length === 0) return null;
            return {
              tagName: albumName,
              foto: {
                id: album.imagens[0].id,
                titulo: album.titulo,
                descricao: album.descricao,
                imagem: album.imagens[0].imagem,
                categoria: album.categoria,
                subcategoria: album.subcategoria,
              },
            } as RandomizedTag;
          })
          .filter((item): item is RandomizedTag => item !== null)
      ).slice(0, 20);
      setSlides(randomized);
    } else if (mode === "fotos" && tagName) {
      const album = projetosData[tagName];
      const albumPhotos = album && album.imagens
        ? album.imagens.map((item, index) => ({
          id: `${tagName}-${index}`,
          titulo: album.titulo,
          descricao: album.descricao,
          imagem: item.imagem,
          categoria: album.categoria,
          subcategoria: album.subcategoria,
          albumName: tagName,
          tagName: tagName,
        }))
        : [];
      setSlides(albumPhotos);
    } else if (mode === "fotos" || mode === "tags") {
      const allProjects = Object.entries(projetosData)
        .slice(0, 20)
        .flatMap(([albumName, album]) =>
          album.imagens.map((item, index) => ({
            id: `${albumName}-${index}`,
            titulo: album.titulo,
            descricao: album.descricao,
            imagem: item.imagem,
            categoria: album.categoria,
            subcategoria: album.subcategoria,
            tagName: albumName,
            albumName: albumName,
          }))
        );
      setSlides(shuffleArray(allProjects));
    }
  }, [mode, photos, tagName]);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);

      // Carrega dados do banco de dados se estiver vazio
      if (Object.keys(data).length === 0) {
        await loadProjetosFromDB();
      }

      loadSlides();
      setIsLoading(false);
    };

    initializeData();

    return () => {
      setSlides([]);
      setCurrentTitle("");
    };
  }, [loadSlides]);

  // Pré-carregar imagens críticas
  useEffect(() => {
    if (!isLoading && slides.length > 0) {
      const criticalImages = slides.slice(0, 3).map(slide => 
        isRandomizedTag(slide) ? slide.foto.imagem : slide.imagem
      );
      preloadCriticalImages(criticalImages);
    }
  }, [isLoading, slides]);

  // Pré-carregar todas as imagens do swiper
  useEffect(() => {
    if (!isLoading && slides.length > 0) {
      const imageUrls = slides.map(slide => 
        isRandomizedTag(slide) ? slide.foto.imagem : slide.imagem
      );
      preloadImages(imageUrls);
    }
  }, [isLoading, slides, preloadImages]);

  // Adicionar evento de tecla ESC para fechar modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modal && onClose) {
        onClose();
      }
    };

    if (modal) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [modal, onClose]);

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const currentIndex = swiper.realIndex;
      const activeSlide = slides[currentIndex];
      if (!activeSlide) return;

      if (isRandomizedTag(activeSlide)) {
        setCurrentTitle(activeSlide.tagName);
        onSlideChange?.(activeSlide.foto);
        // Pass album name and category to parent component
        onAlbumChange?.(activeSlide.tagName, activeSlide.foto.categoria || "");
      } else {
        setCurrentTitle(activeSlide.tagName || activeSlide.categoria || "");
        onSlideChange?.(activeSlide);
        // Pass album name and category to parent component
        onAlbumChange?.(activeSlide.albumName || activeSlide.tagName || "", activeSlide.categoria || "");
      }
    },
    [slides, onSlideChange, onAlbumChange]
  );

  const handleClick = useCallback(
    (project: ProjetoComTag | RandomizedTag, index: number) => {
      if (modal) return;
      if (isRandomizedTag(project)) {
        if (onSlideClick) {
          onSlideClick(project.foto, index);
        } else {
          router.push(`/albuns/${encodeURIComponent(project.tagName)}`);
        }
      } else {
        if (onSlideClick) {
          onSlideClick(project, index);
        } else if (project.categoria) {
          router.push(`/albuns/${encodeURIComponent(project.categoria)}`);
        }
      }
    },
    [modal, onSlideClick, router]
  );

  // Container para o modal ocupa 100vh
  const containerClasses = useMemo(
    () =>
      modal
        ? "fixed inset-0 z-[9999] flex items-center justify-center h-[100vh] w-full backdrop-blur-sm"
        : "relative w-full h-[calc(100vh-35px)]",
    [modal]
  );

  const swiperConfig = useMemo(() => {
    const config: Record<string, unknown> = {
      modules: [Navigation, Keyboard, Zoom],
      // Usar slide effect em vez de fade para melhor navegação
      effect: "slide",
      spaceBetween: 0,
      slidesPerView: 1,
      navigation: true,
      pagination: !hidePagination,
      loop: slides.length > 1,
      initialSlide,
      keyboard: { enabled: true, onlyInViewport: false },
      zoom: {
        maxRatio: 3,
        minRatio: 1,
        toggle: true,
        containerClass: 'swiper-zoom-container',
      },
      className: `swiper-container ${fullSize ? "swiper-fullsize" : ""
        } ${modal ? "modal" : ""} ${mode === "albuns" ? "swiper-container-albuns" : ""}`,
      onSlideChange: handleSlideChange,
    };
    return config;
  }, [
    mode,
    hidePagination,
    slides.length,
    modal,
    fullSize,
    initialSlide,
    handleSlideChange,
  ]);

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <div className="loader"></div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className={containerClasses}>
        <div className="text-xl" style={{ color: 'var(--foreground)' }}>Nenhuma foto encontrada</div>
      </div>
    );
  }

  return (
    <div id={`swiper-container-${tagName}`} className={containerClasses}
      style={modal ? { backgroundColor: 'var(--overlay-strong)' } : {}}>
      <Suspense fallback={<div className="loader" />}>
        <Swiper {...swiperConfig}>
          {slides.map((slide, index) => (
            <SwiperSlide
              key={
                isRandomizedTag(slide)
                  ? `${slide.tagName}-${index}`
                  : slide.id
              }
              onClick={(e) => {
                e.preventDefault();
                handleClick(slide, index);
              }}
              className={`relative ${modal ? "cursor-zoom-in" : "cursor-pointer"}`}
            >
              <div className="swiper-zoom-container">
                <div
                  className={
                    modal
                      ? "relative w-full h-full flex items-center justify-center"
                      : fullSize
                        ? "relative w-full h-full flex items-center justify-center"
                        : mode === "fotos"
                          ? "relative w-full aspect-square overflow-hidden rounded-md"
                          : "relative w-full h-full overflow-hidden rounded-md"
                  }
                >
                  <SwiperImage
                    src={
                      isRandomizedTag(slide)
                        ? slide.foto.imagem
                        : slide.imagem
                    }
                    alt={
                      isRandomizedTag(slide)
                        ? slide.tagName
                        : slide.titulo
                    }
                    modal={modal}
                    fullSize={fullSize}
                    priority={priority}
                    index={index}
                    mode={mode}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {modal && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full w-10 h-10 flex items-center justify-center text-2xl z-[10000] transition-colors"
            style={{
              backgroundColor: 'var(--overlay)',
              color: 'var(--foreground)'
            }}
            aria-label="Fechar"
          >
            ✕
          </button>
        )}
      </Suspense>
    </div>
  );
}
