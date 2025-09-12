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
}

export function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = "",
  priority = false,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  console.log('🖼️ OptimizedImage: Loading', src);

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
    onLoad?.();
  };

  const handleError = () => {
    console.log('❌ OptimizedImage: Failed to load', src);
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
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
          className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
    </div>
  );
}

// Hook for preloading images
export function useImagePreloader(images: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImages = async () => {
      console.log('🔄 ImagePreloader: Starting preload for', images.length, 'images');
      const promises = images.map(src => {
        return new Promise<void>((resolve, reject) => {
          if (loadedImages.has(src)) {
            resolve();
            return;
          }

          const img = document.createElement('img');
          img.onload = () => {
            setLoadedImages(prev => new Set(prev).add(src));
            resolve();
          };
          img.onerror = reject;
          img.src = src;
        });
      });

      try {
        await Promise.all(promises);
        console.log('✅ ImagePreloader: Successfully preloaded', images.length, 'images');
      } catch (error) {
        console.log('❌ ImagePreloader: Some images failed to preload:', error);
      }
    };

    if (images.length > 0) {
      preloadImages();
    }
  }, [images, loadedImages]);

  return loadedImages;
}