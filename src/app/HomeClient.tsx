// Conteúdo para: src/app/HomeClient.tsx

"use client";

import CustomSwiper from "@/components/CustomSwiper";
import { useState } from 'react';
import type { Projeto } from "@/types/types";

// O componente agora recebe os dados via props
interface HomeClientProps {
  swiperPhotos: Projeto[];
}

export default function HomeClient({ swiperPhotos }: HomeClientProps) {
  // A lógica de estado para o título pode continuar, se você for usá-la
  const [currentAlbum, setCurrentAlbum] = useState('');

  return (
    <div className="h-[calc(100vh-5rem)] md:h-screen relative overflow-hidden">
      <CustomSwiper 
        mode="albuns"
        // Passamos os dados recebidos do servidor para a prop 'photos'
        photos={swiperPhotos}
        hidePagination={false}
        onSlideChange={(projeto) => {
          setCurrentAlbum(projeto.categoria || '');
        }}
      />
    </div>
  );
}