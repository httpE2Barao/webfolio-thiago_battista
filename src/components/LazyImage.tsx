"use client";

import { useState, useRef, useEffect } from "react";
import { OptimizedImage } from "./OptimizedImage";

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  blurDataURL?: string;
}

export function LazyImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = "",
  placeholder = "empty", // Mudado de "blur" para "empty" para evitar erros
  threshold = 0.1,
  rootMargin = "0px",
  onLoad,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 80,
  blurDataURL,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Se o placeholder é 'blur' mas não temos blurDataURL, mudar para 'empty'
  const effectivePlaceholder = placeholder === 'blur' && !blurDataURL ? 'empty' : placeholder;

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse"
          style={{ backgroundColor: 'var(--background-secondary)' }}
        />
      )}
      {isInView && (
        <OptimizedImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={handleLoad}
          priority={priority}
          sizes={sizes}
          quality={quality}
          placeholder={effectivePlaceholder as "blur" | "empty"}
          blurDataURL={blurDataURL}
        />
      )}
    </div>
  );
}