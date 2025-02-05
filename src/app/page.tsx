"use client";
import CustomSwiper from "@/components/CustomSwiper";
import TituloResponsivo from "@/components/TituloResponsivo";
import { useState } from 'react';

export default function HomePage() {
  const [currentAlbum, setCurrentAlbum] = useState('');

  return (
    <div className="h-screen relative">
      <CustomSwiper 
        mode="albuns"
        hidePagination={false}
        onSlideChange={(projeto) => {
          setCurrentAlbum(projeto.categoria || '');
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <TituloResponsivo className="text-white text-6xl font-bold px-4 py-2 rounded-md text-center capitalize">
          {currentAlbum.replace(/-/g, ' ')}
        </TituloResponsivo>
      </div>
    </div>
  );
}
