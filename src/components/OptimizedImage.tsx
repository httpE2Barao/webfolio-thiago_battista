"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

// Cache para imagens já carregadas
const imageCache = new Map<string, boolean>();

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = "",
  priority = false,
  onLoad,
  onError,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 80,
  placeholder = 'empty',
  blurDataURL
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Verificar se a imagem já está no cache
  const isCached = imageCache.has(src);

  useEffect(() => {
    // Se a imagem já está no cache, não precisa mostrar o estado de carregamento
    if (isCached) {
      setIsLoading(false);
    }
  }, [isCached]);

  // Auto-reload functionality
  useEffect(() => {
    const reloadInterval = setInterval(() => {
      if (hasError && retryCount < 3) {
        const timestamp = new Date().getTime();
        setImgSrc(`${src}?t=${timestamp}`);
        setHasError(false);
        setIsLoading(true);
        setRetryCount(prev => prev + 1);
      }
    }, 5000); // Try to reload every 5 seconds

    return () => clearInterval(reloadInterval);
  }, [hasError, retryCount, src]);

  const handleLoad = () => {
    console.log('✅ OptimizedImage: Loaded successfully', src);
    setIsLoading(false);
    setHasError(false);
    
    // Adicionar ao cache quando carregada com sucesso
    imageCache.set(src, true);
    
    onLoad?.();
  };

  const handleError = () => {
    console.log('❌ OptimizedImage: Failed to load', src);
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Se o placeholder é 'blur' mas não temos blurDataURL, mudar para 'empty'
  const effectivePlaceholder = placeholder === 'blur' && !blurDataURL ? 'empty' : placeholder;

  return (
    <div className={`relative ${className}`}>
      {isLoading && !isCached && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="text-gray-200">Carregando...</div>
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center">
          <div className="text-gray-200 mb-2">Erro ao carregar imagem</div>
          <div className="text-sm text-gray-300">
            Tentativa {retryCount}/3 - Aguardando...
          </div>
        </div>
      ) : (
        <Image
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} transition-opacity duration-300 ${isLoading && !isCached ? 'opacity-0' : 'opacity-100'}`}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
          quality={quality}
          placeholder={effectivePlaceholder}
          blurDataURL={blurDataURL}
        />
      )}
    </div>
  );
}

// Hook para pré-carregamento de imagens com cache
export function useImagePreloader(images: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImages = async () => {
      console.log('🔄 ImagePreloader: Starting preload for', images.length, 'images');
      
      // Filtrar apenas imagens que ainda não estão no cache
      const imagesToLoad = images.filter(src => !imageCache.has(src));
      
      if (imagesToLoad.length === 0) {
        console.log('✅ ImagePreloader: All images already cached');
        return;
      }
      
      const promises = imagesToLoad.map(src => {
        return new Promise<void>((resolve, reject) => {
          const img = document.createElement('img');
          img.onload = () => {
            // Adicionar ao cache quando pré-carregada com sucesso
            imageCache.set(src, true);
            setLoadedImages(prev => new Set(prev).add(src));
            resolve();
          };
          img.onerror = reject;
          img.src = src;
        });
      });

      try {
        await Promise.all(promises);
        console.log('✅ ImagePreloader: Successfully preloaded', imagesToLoad.length, 'images');
      } catch (error) {
        console.log('❌ ImagePreloader: Some images failed to preload:', error);
      }
    };

    if (images.length > 0) {
      preloadImages();
    }
  }, [images]);

  return loadedImages;
}

// Função para limpar o cache de imagens (útil para liberar memória)
export function clearImageCache() {
  imageCache.clear();
  console.log('🗑️ Image cache cleared');
}

// Função para pré-carregar imagens críticas com alta prioridade
export function preloadCriticalImages(images: string[]) {
  images.forEach(src => {
    if (!imageCache.has(src)) {
      const img = document.createElement('img');
      img.onload = () => imageCache.set(src, true);
      img.src = src;
    }
  });
}