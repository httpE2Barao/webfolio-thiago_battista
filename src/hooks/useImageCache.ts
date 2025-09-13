import { useCallback, useEffect, useState } from 'react';
import { useImageCache } from '@/components/ImageCacheProvider';
import { useImagePreloader, preloadCriticalImages, clearImageCache } from '@/components/OptimizedImage';

/**
 * Hook para gerenciar o cache de imagens em todo o sistema
 * @returns {Object} Funções e estado para gerenciar o cache de imagens
 */
export function useImageCacheManager() {
  const { clearCache: clearGlobalCache } = useImageCache();
  const loadedImages = useImagePreloader([]); // Inicializar com array vazio

  /**
   * Pré-carrega um conjunto de imagens
   * @param {string[]} images - Array de URLs de imagens para pré-carregar
   */
  const preloadImages = useCallback((images: string[]) => {
    if (!images || images.length === 0) return;
    
    // Pré-carregar imagens críticas (primeiras 4)
    const criticalImages = images.slice(0, 4);
    preloadCriticalImages(criticalImages);
    
    // Não podemos chamar o hook diretamente aqui, então usamos a função preloadCriticalImages
    // para pré-carregar as imagens restantes
    const remainingImages = images.slice(4);
    if (remainingImages.length > 0) {
      preloadCriticalImages(remainingImages);
    }
  }, []);

  /**
   * Limpa o cache de imagens
   */
  const clearImageCacheData = useCallback(() => {
    clearImageCache();
    clearGlobalCache();
  }, [clearGlobalCache]);

  /**
   * Limpa o cache de imagens quando o componente é desmontado
   */
  useEffect(() => {
    return () => {
      // Opcional: limpar cache quando o componente é desmontado
      // clearImageCacheData();
    };
  }, [clearImageCacheData]);

  return {
    preloadImages,
    clearCache: clearImageCacheData,
    loadedImages,
  };
}

/**
 * Hook para otimizar o carregamento de imagens em páginas com muitas imagens
 * @param {string[]} images - Array de URLs de imagens
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.preloadCritical - Se deve pré-carregar imagens críticas
 * @param {boolean} options.lazyLoad - Se deve carregar as imagens sob demanda
 * @returns {Object} Estado e funções para gerenciar o carregamento de imagens
 */
export function useOptimizedImageLoading(
  images: string[],
  options: {
    preloadCritical?: boolean;
    lazyLoad?: boolean;
  } = {}
) {
  const { preloadCritical = true, lazyLoad = false } = options;
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const { preloadImages } = useImageCacheManager();

  // Pré-carregar imagens críticas
  useEffect(() => {
    if (preloadCritical && images.length > 0) {
      const criticalImages = images.slice(0, 4);
      preloadCriticalImages(criticalImages);
      
      // Adicionar ao estado de carregamento
      setLoadingImages((prev: Set<string>) => {
        const newSet = new Set(prev);
        criticalImages.forEach(img => newSet.add(img));
        return newSet;
      });
    }
  }, [images, preloadCritical]);

  // Pré-carregar todas as imagens
  useEffect(() => {
    if (!lazyLoad && images.length > 0) {
      preloadImages(images);
    }
  }, [images, lazyLoad, preloadImages]);

  // Simular carregamento de imagens
  const loadImage = useCallback((src: string) => {
    if (loadedImages.has(src)) return;
    
    setLoadingImages((prev: Set<string>) => {
      const newSet = new Set(prev);
      newSet.add(src);
      return newSet;
    });
    
    // Simular tempo de carregamento
    setTimeout(() => {
      setLoadedImages((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.add(src);
        return newSet;
      });
      
      setLoadingImages((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.delete(src);
        return newSet;
      });
    }, 300);
  }, [loadedImages]);

  return {
    loadedImages,
    loadingImages,
    loadImage,
  };
}