"use client";

import React, { Suspense, useCallback, useMemo, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from 'swiper';
import "swiper/css/bundle";

import type { Projeto, Projetos, RandomizedTag, ProjetoComTag } from "@/types/types";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import dynamic from 'next/dynamic';

import { projetos as data } from "@/data/projetos";
import { shuffleArray } from "@/lib/shuffleArray";

// Importação dinâmica do componente TituloResponsivo
const TituloResponsivo = dynamic(() => import("./TituloResponsivo"), {
  ssr: false,
  loading: () => <div className="h-16" />
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
  autoplay?: boolean;
};

const isRandomizedTag = (item: any): item is RandomizedTag => (
  item !== null &&
  typeof item === 'object' &&
  'tagName' in item &&
  'foto' in item &&
  typeof item.foto === 'object' &&
  'id' in item.foto
);

// Componente memoizado para a imagem
const SwiperImage = React.memo(({ src, alt, modal, fullSize, priority, index }: {
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
    sizes={modal ? "80vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
    className={`${modal || fullSize ? "object-contain !p-4" : "object-cover"}`}
    priority={priority && index === 0}
    quality={90}
    loading={index < 3 ? "eager" : "lazy"}
  />
));
SwiperImage.displayName = 'SwiperImage';

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
  autoplay = true,
}: CustomSwiperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [slides, setSlides] = useState<RandomizedTag[] | ProjetoComTag[]>([]);
  const [activeIndex, setActiveIndex] = useState(initialSlide);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTitle, setCurrentTitle] = useState("");
  const isHomePage = pathname === "/";

  const loadSlides = useCallback(async () => {
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
    
    // Considerando que 'data' possui a estrutura:
    // { [albumName: string]: { id, titulo, descricao, imagem, categoria, subcategoria }[] }
    const projetosData = data as Projetos;

    if (mode === "albuns") {
      const randomized = shuffleArray(
        Object.entries(projetosData)
          .map(([albumName, album]) => {
            // album é um array de objetos; usamos o primeiro item como destaque
            if (!album || album.length === 0) return null;
            return {
              tagName: albumName,
              // Criamos um objeto RandomizedTag com a propriedade 'foto'
              foto: {
                id: album[0].id,
                titulo: album[0].titulo,
                descricao: album[0].descricao,
                // Usamos a propriedade 'imagem' do primeiro item
                imagem: album[0].imagem,
                categoria: album[0].categoria,
                subcategoria: album[0].subcategoria,
              },
            } as RandomizedTag;
          })
          .filter((item): item is RandomizedTag => item !== null)
      ).slice(0, 20);
      setSlides(randomized);
    } else if (mode === "fotos" && tagName) {
      // Para o modo "fotos", supondo que tagName corresponde à chave do álbum
      const album = projetosData[tagName];
      const albumPhotos = album
        ? album.map((item, index) => ({
            id: `${tagName}-${index}`,
            titulo: item.titulo,
            descricao: item.descricao,
            imagem: item.imagem,
            categoria: item.categoria,
            subcategoria: item.subcategoria,
            albumName: tagName,
            tagName: tagName, // Para garantir o tipo ProjetoComTag
          }))
        : [];
      setSlides(albumPhotos);
    } else if (mode === "fotos" || mode === "tags") {
      // Se não houver tagName específica, pegamos as imagens de alguns álbuns
      const allProjects = Object.entries(projetosData)
        .slice(0, 20)
        .flatMap(([albumName, album]) =>
          album.map((item, index) => ({
            id: `${albumName}-${index}`,
            titulo: item.titulo,
            descricao: item.descricao,
            imagem: item.imagem,
            categoria: item.categoria,
            subcategoria: item.subcategoria,
            tagName: albumName,
            albumName: albumName,
          }))
        );
      setSlides(shuffleArray(allProjects));
    }
  }, [mode, photos, tagName]);

  useEffect(() => {
    setIsLoading(true);
    loadSlides().finally(() => setIsLoading(false));

    return () => {
      setSlides([]);
      setCurrentTitle("");
    };
  }, [loadSlides]);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    const currentIndex = swiper.realIndex;
    setActiveIndex(currentIndex);
    
    const activeSlide = slides[currentIndex];
    if (!activeSlide) return;

    if (isRandomizedTag(activeSlide)) {
      setCurrentTitle(activeSlide.tagName);
      onSlideChange?.(activeSlide.foto);
    } else {
      setCurrentTitle(activeSlide.tagName || activeSlide.categoria || "");
      onSlideChange?.(activeSlide);
    }
  }, [slides, onSlideChange]);

  const handleClick = useCallback((project: ProjetoComTag | RandomizedTag, index: number) => {
    if (modal) return;
    
    if (isRandomizedTag(project)) {
      onSlideClick ? onSlideClick(project.foto, index) : 
        router.push(`/albuns/${encodeURIComponent(project.tagName)}`);
    } else {
      onSlideClick ? onSlideClick(project, index) : 
        project.categoria && router.push(`/albuns/${encodeURIComponent(project.categoria)}`);
    }
  }, [modal, onSlideClick, router]);

  const containerClasses = modal
    ? "fixed inset-0 z-[9999] bg-black bg-opacity-95 flex items-center justify-center"
    : "relative w-full h-[calc(100vh-35px)]";

  const swiperConfig = useMemo(() => ({
    modules: [Navigation, EffectFade],
    effect: mode === "fotos" || mode === "tags" ? "fade" : undefined,
    spaceBetween: 0,
    slidesPerView: 1,
    navigation: true,
    pagination: !hidePagination,
    loop: slides.length > 1,
    initialSlide,
    className: `swiper-container ${fullSize ? 'swiper-fullsize' : ''} ${modal ? 'modal' : ''} ${mode === 'albuns' ? 'swiper-container-albuns' : ''}`,
    onSlideChange: handleSlideChange,
    preloadImages: true,
    watchSlidesProgress: true,
    updateOnWindowResize: true,
    preventInteractionOnTransition: true,
  }), [mode, hidePagination, slides.length, autoplay, modal, fullSize, initialSlide, handleSlideChange]);

  if (isLoading) {
    return <div className={containerClasses}><div className="loader"></div></div>;
  }

  if (slides.length === 0) {
    return <div className={containerClasses}><div className="text-xl text-white">Nenhuma foto encontrada</div></div>;
  }

  return (
    <div id={`swiper-container-${tagName}`} className={containerClasses}>
      <Suspense fallback={<div className="loader" />}>
        <Swiper {...swiperConfig}>
          {slides.map((slide, index) => (
            <SwiperSlide
              key={isRandomizedTag(slide) ? `${slide.tagName}-${index}` : slide.id}
              onClick={(e) => {
                e.preventDefault();
                handleClick(slide, index);
              }}
              className={`relative ${!modal && 'cursor-pointer'}`}
            >
              <div className={
                modal
                  ? "relative w-[90vw] h-full max-w-[1200px] flex items-center justify-center m-auto"
                  : fullSize
                  ? "relative w-full h-full flex items-center justify-center bg-black/5"
                  : "relative w-full h-full overflow-hidden rounded-md"
              }>
                <SwiperImage
                  src={isRandomizedTag(slide) ? slide.foto.imagem : slide.imagem}
                  alt={isRandomizedTag(slide) ? slide.tagName : slide.titulo}
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
                {currentTitle.replace(/-/g, ' ')}
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
