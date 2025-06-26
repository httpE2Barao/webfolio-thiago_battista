// src/app/albuns/page.tsx

import { sql } from '@vercel/postgres';
import { Projeto } from '@/types/types'; 
import AlbunsClient from './AlbunsClient';

// Definindo a estrutura do que vem do banco de dados
interface AlbumDoBanco {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  imagens: string[]; // Vem como um array de URLs
}

// Esta função de agrupamento agora roda no servidor!
function agruparAlbunsPorCategoria(albuns: AlbumDoBanco[]): Record<string, Projeto[]> {
  const projetosPorCategoria: Record<string, Projeto[]> = {};

  albuns.forEach((album) => {
    // Se não houver imagens, ignoramos o álbum
    if (!album.imagens || album.imagens.length === 0) {
      return;
    }

    const mainCategory = album.categoria || "outros";
    if (!projetosPorCategoria[mainCategory]) {
      projetosPorCategoria[mainCategory] = [];
    }
    
    // Criamos um objeto 'Projeto' para o componente cliente
    projetosPorCategoria[mainCategory].push({
      id: album.id,
      titulo: album.titulo,
      descricao: album.descricao,
      imagem: album.imagens[0], // A imagem de capa é a primeira da lista
      categoria: album.categoria,
      subcategoria: album.subcategoria,
      albumName: album.id,
    });
  });

  return projetosPorCategoria;
}


// Este é o Componente de Servidor. Ele é async!
export default async function AlbunsPage() {
  
  // 1. Busca todos os álbuns do banco de dados
  const { rows: albuns } = await sql<AlbumDoBanco>`
    SELECT id, titulo, descricao, categoria, subcategoria, imagens 
    FROM albums 
    ORDER BY created_at DESC;
  `;

  // 2. Processa e agrupa os dados no servidor
  const projetosPorCategoria = agruparAlbunsPorCategoria(albuns);

  // 3. Renderiza o Componente de Cliente, passando os dados prontos como props
  return <AlbunsClient projetosPorCategoria={projetosPorCategoria} />;
}

// Opcional: Garante que a página sempre busque os dados mais recentes
export const revalidate = 0;