"use client";

import { useState, useEffect, useRef } from "react";
import { LazyImage } from "./LazyImage";
import { useImageCacheManager } from "@/hooks/useImageCache";

interface ProgressiveImageGalleryProps {
  images: {
    id: string;
    src: string;
    alt: string;
    width?: number;
    height?: number;
    onClick?: () => void;
  }[];
  itemsPerLoad?: number;
  initialLoadCount?: number;
  className?: string;
  imageClassName?: string;
  gap?: string;
  columns?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

export function ProgressiveImageGallery({
  images,
  itemsPerLoad = 12,
  initialLoadCount = 12,
  className = "",
  imageClassName = "",
  gap = "gap-4",
  columns = 3,
  onLoadMore,
  hasMore = true,
  loadingMore = false,
}: ProgressiveImageGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(initialLoadCount);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { preloadImages } = useImageCacheManager();

  // Pré-carregar as próximas imagens
  useEffect(() => {
    const nextImages = images.slice(visibleCount, visibleCount + itemsPerLoad);
    if (nextImages.length > 0) {
      preloadImages(nextImages.map(img => img.src));
    }
  }, [visibleCount, images, itemsPerLoad, preloadImages]);

  // Configurar Intersection Observer para carregamento infinito
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMoreImages();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "200px",
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading]);

  const loadMoreImages = () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    // Se houver um callback de carregamento, use-o
    if (onLoadMore) {
      onLoadMore();
    } else {
      // Caso contrário, apenas aumente o contador
      setTimeout(() => {
        setVisibleCount((prev) => prev + itemsPerLoad);
        setIsLoading(false);
      }, 500);
    }
  };

  const visibleImages = images.slice(0, visibleCount);

  // Classes CSS responsivas para colunas
  const getColumnsClass = () => {
    switch (columns) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
      case 4:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      case 5:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
    }
  };

  return (
    <div className={className}>
      <div className={`grid ${getColumnsClass()} ${gap}`}>
        {visibleImages.map((image) => (
          <div
            key={image.id}
            className="relative overflow-hidden rounded-lg group cursor-pointer"
            onClick={image.onClick}
          >
            <LazyImage
              src={image.src}
              alt={image.alt}
              width={image.width || 400}
              height={image.height || 400}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${imageClassName}`}
              placeholder="empty" // Garantir que não use blur sem blurDataURL
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {image.alt}
              </span>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div
          ref={loaderRef}
          className="flex justify-center items-center py-8"
        >
          {isLoading || loadingMore ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mb-4"
                style={{ borderColor: 'var(--button-primary)' }}></div>
              <p>Carregando mais imagens...</p>
            </div>
          ) : (
            <button
              onClick={loadMoreImages}
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: 'var(--button-primary)',
                color: 'white'
              }}
            >
              Carregar Mais
            </button>
          )}
        </div>
      )}

      {!hasMore && (
        <div className="text-center py-8 text-gray-500">
          Todas as imagens foram carregadas
        </div>
      )}
    </div>
  );
}