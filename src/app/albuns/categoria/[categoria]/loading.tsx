export default function AlbumLoadingSkeleton() {
  return (
    <div className="p-4 md:p-8 animate-pulse">
      {/* Skeleton para o Título e Descrição */}
      <div className="max-w-3xl mx-auto text-center mb-6">
        <div className="h-10 w-3/4 bg-gray-700 rounded-md mx-auto mb-4"></div>
        <div className="h-4 w-full bg-gray-700 rounded-md mx-auto"></div>
      </div>

      {/* Skeleton para a Grade de Fotos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 mt-2">
        {/* Gera 12 caixas de placeholder para simular o carregamento das imagens */}
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="relative w-full h-64 xl:h-80 bg-gray-800 rounded-lg"
          ></div>
        ))}
      </div>
    </div>
  );
}
