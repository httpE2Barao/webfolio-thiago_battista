"use client";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Projetos } from "@/data/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import data from "@/data/projetos.js";
import Image from "next/image";

type RandomizedAlbum = {
  categoria: string;
  foto: {
    id: string;
    titulo: string;
    descricao: string;
    imagem: string;
  };
};

const { projetos } = data as { projetos: Projetos };

export default function AlbumComponent() {
  const [randomizedAlbums, setRandomizedAlbums] = useState<RandomizedAlbum[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Seleciona uma foto aleatória de cada álbum
    const randomized = Object.entries(projetos).map(([categoria, fotos]) => ({
      categoria,
      foto: fotos[Math.floor(Math.random() * fotos.length)],
    }));
    setRandomizedAlbums(randomized);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Meus Projetos</h2>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-[85vh]"
      >
        {randomizedAlbums.map(({ categoria, foto }) => (
          <SwiperSlide
            key={categoria}
            onClick={() => router.push(`/albuns/${categoria}`)}
            className="cursor-pointer relative"
          >
            <div className="relative w-full h-full overflow-hidden rounded-md">
              <Image
                src={foto.imagem}
                alt={categoria}
                layout="fill"
                objectFit="cover"
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <h2 className="text-white text-2xl font-semibold capitalize">
                  {categoria}
                </h2>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
