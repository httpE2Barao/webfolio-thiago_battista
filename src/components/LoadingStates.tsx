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

