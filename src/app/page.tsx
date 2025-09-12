"use client";
import { useState } from "react";
import CustomSwiper from "@/components/CustomSwiper";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [currentAlbum, setCurrentAlbum] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");

  const handleAlbumChange = (albumName: string, category: string) => {
    setCurrentAlbum(albumName);
    setCurrentCategory(category);
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentCategory) {
      router.push(`/albuns/categoria/${encodeURIComponent(currentCategory)}`);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] md:h-screen relative overflow-hidden">
      <CustomSwiper
        mode="albuns"
        hidePagination={false}
        onAlbumChange={handleAlbumChange}
      />
      
      {/* Content overlay */}
      <div className="titulo-overlay">
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <h1
            className="texto-invertido titulo text-center px-4"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              background: 'transparent'
            }}
          >
            {currentAlbum.replace(/-/g, ' ') || "Portfólio"}
          </h1>
          <p
            className="texto-invertido subtitulo text-center px-4 cursor-pointer pointer-events-auto border-b border-transparent hover:border-white transition-all"
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2rem)',
              background: 'transparent'
            }}
            onClick={handleCategoryClick}
          >
            {currentCategory || "Fotos"}
          </p>
        </div>
      </div>
    </div>
  );
}