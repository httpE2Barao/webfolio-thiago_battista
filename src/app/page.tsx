// src/app/page.tsx

import { sql } from '@/lib/db';
import CustomSwiper from "@/components/CustomSwiper";
import { Projeto } from '@/types/types';
import { shuffleArray } from '@/lib/shuffleArray';

// Definindo a estrutura do que vem do banco de dados
interface AlbumDoBanco {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  imagens: { id: string, imagem: string }[];
}

// Processa os dados do banco para o formato que o CustomSwiper espera
function processarAlbuns(albuns: AlbumDoBanco[]): Projeto[] {
  return albuns.map(album => ({
    id: album.id,
    titulo: album.titulo,
    descricao: album.descricao,
    // Garante que pegamos a primeira imagem como capa
    imagem: album.imagens?.[0]?.imagem || '/placeholder.jpg',
    categoria: album.categoria,
    subcategoria: album.subcategoria,
    albumName: album.id,
  }));
}

export default async function HomePage() {
  // 1. Busca os álbuns no banco de dados
  const { rows } = await sql`SELECT id, titulo, descricao, categoria, subcategoria, imagens FROM albums;`;

  // 2. Garante que o campo 'imagens' seja um array de objetos
  const albunsFormatados: AlbumDoBanco[] = rows.map(row => ({
    ...row,
    imagens: typeof row.imagens === 'string' ? JSON.parse(row.imagens) : (row.imagens || []),
  })) as AlbumDoBanco[];

  // 3. Processa e embaralha os álbuns para a exibição
  const projetosParaSwiper = shuffleArray(processarAlbuns(albunsFormatados));

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
