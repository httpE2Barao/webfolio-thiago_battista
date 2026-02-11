import CustomSwiper from "@/components/CustomSwiper";
import { prisma } from '@/lib/prisma';
import { shuffleArray } from '@/lib/shuffleArray';
import type { Projeto } from '@/types/types';

export default async function HomePage() {
  // 1. Busca os álbuns no banco de dados usando Prisma (mais seguro e compatível)
  const albuns = await prisma.album.findMany({
    where: {
      published: true,
      isPrivate: false
    },
    include: {
      Image: {
        orderBy: {
          ordem: 'asc'
        },
        take: 1 // Só precisamos da primeira imagem para a capa no Swiper
      }
    },
    orderBy: {
      ordem: 'asc'
    }
  });

  // 2. Processa os álbuns para o formato que o CustomSwiper espera
  const projetosParaSwiper: Projeto[] = shuffleArray(albuns.map((album: any) => ({
    id: album.id,
    titulo: album.titulo,
    descricao: album.descricao || '',
    // Use coverImage if set, otherwise fall back to first image
    imagem: album.coverImage || album.Image[0]?.path || '/placeholder.jpg',
    coverImageMobile: album.coverImageMobile || undefined,
    coverImageDesktop: album.coverImageDesktop || undefined,
    coverImageMobilePosition: album.coverImageMobilePosition || undefined,
    coverImageDesktopPosition: album.coverImageDesktopPosition || undefined,
    categoria: album.categoria,
    subcategoria: album.subcategoria || '',
    albumName: album.titulo,
  })));


  return (
    // CORREÇÃO: Removemos os cálculos de altura fixos (como h-screen)
    // e instruímos o contêiner a ocupar 100% da altura do seu pai (`main`).
    <div className="relative h-full w-full">
      <CustomSwiper
        mode="albuns"
        photos={projetosParaSwiper}
        hidePagination={false}
      />
    </div>
  );
}
