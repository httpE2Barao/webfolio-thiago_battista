"use client";

import { useState, useEffect } from 'react';
import { useImageCache } from './ImageCacheProvider';

export function ImageCacheStatus() {
  const { clearCache } = useImageCache();
  const [isVisible, setIsVisible] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);

  // Simular tamanho do cache (em um ambiente real, isso seria calculado)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular tamanho do cache entre 0 e 100MB
      setCacheSize(Math.floor(Math.random() * 100));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-2 rounded-full text-xs bg-gray-800 text-white"
        style={{
          backgroundColor: 'var(--overlay)',
          color: 'var(--foreground)'
        }}
        aria-label="Mostrar status do cache"
      >
        Cache
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-xs"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)'
      }}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Status do Cache</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-sm"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Tamanho do cache:</span>
          <span>{cacheSize} MB</span>
        </div>
        
        <div className="flex justify-between">
          <span>Imagens carregadas:</span>
          <span>{Math.floor(cacheSize * 2)}</span>
        </div>
        
        <div className="mt-3 flex space-x-2">
          <button
            onClick={clearCache}
            className="px-3 py-1 rounded text-sm"
            style={{
              backgroundColor: 'var(--button-primary)',
              color: 'white'
            }}
          >
            Limpar Cache
          </button>
        </div>
      </div>
    </div>
  );
}