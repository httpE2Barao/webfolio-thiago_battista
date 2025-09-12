import CategoriaGroup from "@/components/CategoriaGroup";
import TituloResponsivo from "@/components/TituloResponsivo";
import { getCachedCategorias } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function AlbunsPage() {
  const projetosPorCategoria = await getCachedCategorias();
  const totalCategorias = Object.keys(projetosPorCategoria).length;
  const totalProjetos = Object.values(projetosPorCategoria).reduce((acc, projetos) => acc + projetos.length, 0);

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <div className="text-center py-16 px-4">
        <TituloResponsivo className="text-4xl md:text-6xl lg:text-7xl mb-6">
          Álbuns
        </TituloResponsivo>
        <div className="flex justify-center space-x-8 text-lg" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            <span>{totalCategorias} categorias</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span>{totalProjetos} projetos</span>
          </div>
        </div>
      </div>

      {/* Categories grid */}
      <div className="pb-20 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {Object.entries(projetosPorCategoria)
            .filter(([, projetos]) => projetos.length > 0)
            .map(([categoria, projetos]) => (
              <CategoriaGroup key={categoria} categoria={categoria} projetos={projetos} />
            ))}
        </div>
      </div>
    </div>
  );
}