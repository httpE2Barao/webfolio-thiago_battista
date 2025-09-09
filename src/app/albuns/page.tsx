import CustomSwiper from "@/components/CustomSwiper";
import TituloResponsivo from "@/components/TituloResponsivo";
import { Projeto, Projetos } from "@/types/types";

async function getProjetosData(): Promise<Projetos> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/projetos`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch projetos');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching projetos:', error);
    return {};
  }
}
/**
 * Agrupa os álbuns (agora objetos) por categoria.
 * Cada entrada do objeto 'projetosData' é um álbum contendo:
 * {
 *   id: string;
 *   titulo: string;
 *   descricao: string;
 *   tags: string[];
 *   imagens: { id: string; imagem: string }[];
 *   categoria: string;
 *   subcategoria: string;
 * }
 */
function agruparProjetosPorCategoria(projetos: Projetos): Record<string, Projeto[]> {
  const projetosPorCategoria: Record<string, Projeto[]> = {};

  Object.entries(projetos).forEach(([albumName, albumData]) => {
    // Se não houver imagens, ignoramos
    if (!albumData.imagens || albumData.imagens.length === 0) {
      return;
    }

    const mainCategory = albumData.categoria || "outros";
    if (!projetosPorCategoria[mainCategory]) {
      projetosPorCategoria[mainCategory] = [];
    }

    // Criamos um objeto 'Projeto' com as informações necessárias
    projetosPorCategoria[mainCategory].push({
      id: albumName, // Usamos o nome do álbum como ID
      titulo: albumName, // Se preferir, use albumData.titulo
      descricao: albumData.descricao,
      imagem: albumData.imagens[0].imagem, // Imagem principal (a primeira do array)
      categoria: albumData.categoria,
      subcategoria: albumData.subcategoria,
      albumName, // guarda o nome do álbum original
    });
  });

  return projetosPorCategoria;
}

export const dynamic = "force-dynamic";

// Cliente component for interactivity
function CategoriaGroup({
  categoria,
  projetos,
}: {
  categoria: string;
  projetos: Projeto[];
}) {
  return (
    <div className="mb-3 last:mb-0 group relative rounded-lg overflow-hidden">
      <div className="transition-transform duration-300 ease-in-out h-[400px] md:h-[500px] lg:h-[600px] relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <CustomSwiper
            mode="albuns"
            photos={projetos}
            tagName={categoria}
            hidePagination={false}
            onSlideClick={() => {
              window.location.href = `/albuns/categoria/${encodeURIComponent(categoria)}`;
            }}
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none bg-gradient-to-t from-black/50 to-transparent">
          <TituloResponsivo className="text-white text-3xl md:text-5xl lg:text-6xl font-semibold px-4 py-2 rounded-md opacity-100 transition-all duration-300 group-hover:opacity-0 group-hover:transform group-hover:translate-y-4">
            {categoria}
          </TituloResponsivo>
        </div>
      </div>
    </div>
  );
}

export default async function AlbunsPage() {
  const projetosData = await getProjetosData();
  const projetosPorCategoria = agruparProjetosPorCategoria(projetosData);

  return (
    <div className="space-y-0 md:space-y-8 py-4">
      {Object.entries(projetosPorCategoria)
        .filter(([, projetos]) => projetos.length > 0)
        .map(([categoria, projetos]) => (
          <CategoriaGroup key={categoria} categoria={categoria} projetos={projetos} />
        ))}
    </div>
  );
}
