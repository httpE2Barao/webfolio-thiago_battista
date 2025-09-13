"use client";

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { clearImageCache } from './OptimizedImage';

interface ImageCacheContextType {
  clearCache: () => void;
}

const ImageCacheContext = createContext<ImageCacheContextType>({
  clearCache: () => {},
});

export const useImageCache = () => useContext(ImageCacheContext);

interface ImageCacheProviderProps {
  children: ReactNode;
}

export function ImageCacheProvider({ children }: ImageCacheProviderProps) {
  // Limpar cache quando a página é fechada ou recarregada
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Opcional: limpar cache quando a página é fechada
      // clearImageCache();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Limpar cache periodicamente para liberar memória
  useEffect(() => {
    const interval = setInterval(() => {
      // Limpar cache a cada 30 minutos para liberar memória
      clearImageCache();
      console.log('🔄 Image cache cleared periodically');
    }, 30 * 60 * 1000); // 30 minutos

    return () => clearInterval(interval);
  }, []);

  const clearCache = () => {
    clearImageCache();
  };

  return (
    <ImageCacheContext.Provider value={{ clearCache }}>
      {children}
    </ImageCacheContext.Provider>
  );
}