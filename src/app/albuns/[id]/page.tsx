// src/app/projetos/[id]/page.tsx
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Projeto, Projetos } from '../../../data/types';

// Importando o módulo usando a sintaxe ESModule
import data from '../../../data/projetos.js';

const { projetos } = data as { projetos: Projetos };

interface Params {
  id: string;
}

interface PageProps {
  params: Promise<Params>;
}

export default async function ProjetoDetalhe({
  params,
}: PageProps): Promise<JSX.Element> {
  // Resolve os valores da promise de params
  const resolvedParams = await params;

  if (!resolvedParams.id) {
    notFound();
  }

  // Filtra todas as fotos do álbum baseado no ID (categoria)
  const album = projetos[resolvedParams.id];

  if (!album || album.length === 0) {
    notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-8 text-center capitalize">{resolvedParams.id}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {album.map((projeto: Projeto) => (
          <div key={projeto.id} className="relative w-full h-80 xl:h-96">
            <Image
              src={projeto.imagem}
              alt={projeto.titulo}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
