"use client";

export const SwiperSkeleton = () => (
  <div className="animate-pulse">
    <div className="w-full h-[400px] bg-gray-800 rounded-lg mb-4"></div>
    <div className="flex justify-between space-x-4">
      <div className="h-2 bg-gray-700 rounded w-1/4"></div>
      <div className="h-2 bg-gray-700 rounded w-1/4"></div>
    </div>
  </div>
);

export const ImageLoader = () => (
  <div className="absolute inset-0 bg-gray-800 animate-pulse rounded-lg"></div>
);

export const HomeSwiperSkeleton = () => (
  <div className="relative w-full h-screen bg-black animate-pulse overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900" />
    <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center gap-4">
      <div className="h-12 bg-gray-800 rounded-lg w-64 md:w-96" />
      <div className="h-4 bg-gray-800 rounded-lg w-32" />
    </div>
  </div>
);

export const CategorySlatSkeleton = () => (
  <div className="w-full space-y-12">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="relative w-full h-[400px] md:h-[500px] bg-gray-900 animate-pulse rounded-2xl overflow-hidden border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 bg-gray-700/50 rounded-lg w-48" />
        </div>
      </div>
    ))}
  </div>
);

export const CardsEffectSkeleton = () => (
  <div className="w-full space-y-32">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="flex flex-col items-center gap-8">
        <div className="relative w-full max-w-2xl aspect-[3/4] md:aspect-video bg-gray-900/50 animate-pulse rounded-2xl border border-white/10 shadow-2xl">
          <div className="absolute inset-10 bg-gray-800/30 rounded-xl" />
          <div className="absolute inset-20 bg-gray-800/20 rounded-xl" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 bg-gray-800 rounded w-48" />
          <div className="h-3 bg-gray-800 rounded w-24" />
        </div>
      </div>
    ))}
  </div>
);

export const AdminDashboardSkeleton = () => (
  <div className="flex-1 p-8 lg:p-12 animate-pulse space-y-12">
    <header className="flex justify-between items-end mb-12">
      <div className="space-y-2">
        <div className="h-3 bg-gray-800 rounded w-20" />
        <div className="h-10 bg-gray-800 rounded w-64" />
      </div>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-900 border border-white/5 rounded-3xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
      <div className="lg:col-span-2 h-96 bg-gray-900 border border-white/5 rounded-3xl" />
      <div className="h-96 bg-gray-900 border border-white/5 rounded-3xl" />
    </div>
  </div>
);

export const GridSkeleton = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="relative w-full h-64 xl:h-80 bg-gray-900/50 animate-pulse rounded-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

