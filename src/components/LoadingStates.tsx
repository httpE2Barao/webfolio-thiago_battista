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