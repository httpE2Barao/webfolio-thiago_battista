"use client";

import React, { Suspense, useCallback, useMemo, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectFade, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css/bundle";

import type { Projeto, Projetos, RandomizedTag, ProjetoComTag } from "@/types/types";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";

import { projetos as data, loadProjetosFromDB } from "@/data/projetos-db";
import { shuffleArray } from "@/lib/shuffleArray";

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
  }: {
    src: string;
    alt: string;
    modal?: boolean;
    fullSize?: boolean;
    priority?: boolean;
    index: number;
  }) => (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={
        modal
          ? "80vw"
          : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      }
      className={`${modal || fullSize ? "object-contain !p-4" : "object-cover"}`}
      priority={priority && index === 0}
      quality={modal ? 100 : 80}
      loading={index < 3 ? "eager" : "lazy"}
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
}: CustomSwiperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [slides, setSlides] = useState<RandomizedTag[] | ProjetoComTag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTitle, setCurrentTitle] = useState("");
  const isHomePage = pathname === "/";

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

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const currentIndex = swiper.realIndex;
      const activeSlide = slides[currentIndex];
      if (!activeSlide) return;

      if (isRandomizedTag(activeSlide)) {
        setCurrentTitle(activeSlide.tagName);
        onSlideChange?.(activeSlide.foto);
      } else {
        setCurrentTitle(activeSlide.tagName || activeSlide.categoria || "");
        onSlideChange?.(activeSlide);
      }
    },
    [slides, onSlideChange]
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
        ? "fixed inset-0 z-[9999] bg-black bg-opacity-95 flex items-center justify-center h-[100vh] w-full"
        : "relative w-full h-[calc(100vh-35px)]",
    [modal]
  );

  const swiperConfig = useMemo(() => {
    const config: Record<string, unknown> = {
      modules: [Navigation, EffectFade, Keyboard],
      // Força o efeito fade para evitar empilhamento de slides
      effect: "fade",
      fadeEffect: { crossFade: true },
      spaceBetween: 0,
      slidesPerView: 1,
      navigation: true,
      pagination: !hidePagination,
      loop: slides.length > 1,
      initialSlide,
      keyboard: { enabled: true, onlyInViewport: false },
      className: `swiper-container ${
        fullSize ? "swiper-fullsize" : ""
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
        <div className="text-xl text-white">Nenhuma foto encontrada</div>
      </div>
    );
  }

  return (
    <div id={`swiper-container-${tagName}`} className={containerClasses}>
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
              className={`relative ${!modal && "cursor-pointer"}`}
            >
              <div
                className={
                  modal
                    ? "relative w-full h-full flex items-center justify-center"
                    : fullSize
                    ? "relative w-full h-full flex items-center justify-center bg-black/5"
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
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {mode === "albuns" && !photos && !modal && currentTitle && isHomePage && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="max-w-[90%] md:max-w-3xl mx-auto">
              <TituloResponsivo className="text-white text-4xl sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl font-bold px-4 py-2 rounded-md text-center capitalize break-words">
                {currentTitle.replace(/-/g, " ")}
              </TituloResponsivo>
            </div>
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
