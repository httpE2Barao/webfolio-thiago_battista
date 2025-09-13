"use client";

import { useState, useEffect, useRef } from "react";
import { LazyImage } from "./LazyImage";
import { useImageCacheManager } from "@/hooks/useImageCache";

interface ImageOptimizerProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  sizes?: string;
  quality?: number;
  cacheKey?: string;
  preload?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
  blurDataURL?: string;
}

export function ImageOptimizer({
  src,
  alt,
  width = 800,
  height = 600,
  className = "",
  priority = false,
  placeholder = "empty", // Mudado de "blur" para "empty" para evitar erros
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 80,
  cacheKey,
  preload = false,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = "0px",
  blurDataURL,
}: ImageOptimizerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const { preloadImages } = useImageCacheManager();
  const cacheRef = useRef<Map<string, boolean>>(new Map());

  // Gerar chave de cache única para esta imagem
  const getCacheKey = () => {
    return cacheKey || `${src}-${width}-${height}`;
  };

  // Verificar se a imagem está no cache
  const isCached = () => {
    const key = getCacheKey();
    return cacheRef.current.has(key);
  };

  // Adicionar imagem ao cache
  const addToCache = () => {
    const key = getCacheKey();
    cacheRef.current.set(key, true);
  };

  // Pré-carregar imagem se necessário
  useEffect(() => {
    if (preload && !isCached()) {
      preloadImages([src]);
      addToCache();
    }
  }, [preload, src, preloadImages]);

  // Tratar erros de carregamento
  const handleError = () => {
    setHasError(true);
    onError?.();
    
    // Tentar recarregar a imagem após um erro
    setTimeout(() => {
      setImageSrc(`${src}?retry=${Date.now()}`);
      setHasError(false);
    }, 1000);
  };

  // Lidar com carregamento bem-sucedido
  const handleLoad = () => {
    setIsLoaded(true);
    addToCache();
    onLoad?.();
  };

  // Se houve erro, mostrar um placeholder
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          backgroundColor: 'var(--background-secondary)'
        }}
      >
        <span className="text-gray-500">Erro ao carregar imagem</span>
      </div>
    );
  }

  // Se o placeholder é 'blur' mas não temos blurDataURL, mudar para 'empty'
  const effectivePlaceholder = placeholder === 'blur' && !blurDataURL ? 'empty' : placeholder;

  return (
    <LazyImage
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${isLoaded ? "opacity-100" : "opacity-90"}`}
      priority={priority}
      placeholder={effectivePlaceholder}
      sizes={sizes}
      quality={quality}
      threshold={threshold}
      rootMargin={rootMargin}
      onLoad={handleLoad}
      blurDataURL={blurDataURL}
    />
  );
}

// Componente para otimizar múltiplas imagens
interface MultipleImageOptimizerProps {
  images: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
  }[];
  containerClassName?: string;
  imageClassName?: string;
  columns?: number;
  gap?: string;
  preloadCount?: number;
}

export function MultipleImageOptimizer({
  images,
  containerClassName = "",
  imageClassName = "",
  columns = 3,
  gap = "gap-4",
  preloadCount = 4,
}: MultipleImageOptimizerProps) {
  const { preloadImages } = useImageCacheManager();

  // Pré-carregar as primeiras imagens
  useEffect(() => {
    const imagesToPreload = images.slice(0, preloadCount).map(img => img.src);
    preloadImages(imagesToPreload);
  }, [images, preloadCount, preloadImages]);

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
    <div className={`grid ${getColumnsClass()} ${gap} ${containerClassName}`}>
      {images.map((image, index) => (
        <div key={`${image.src}-${index}`} className="relative overflow-hidden rounded-lg">
          <ImageOptimizer
            src={image.src}
            alt={image.alt}
            width={image.width || 400}
            height={image.height || 400}
            className={`w-full h-full object-cover ${imageClassName}`}
            priority={image.priority || index < preloadCount}
          />
        </div>
      ))}
    </div>
  );
}