"use client";
import CustomSwiper from "@/components/CustomSwiper";
import { useState } from 'react';

export default function HomePage() {
  const [currentAlbum, setCurrentAlbum] = useState('');

  return (
    <div className="h-[calc(100vh-5rem)] md:h-screen relative overflow-hidden">
      <CustomSwiper 
        mode="albuns"
        hidePagination={false}
        onSlideChange={(projeto) => {
          setCurrentAlbum(projeto.categoria || '');
        }}
      />
    </div>
  );
}
