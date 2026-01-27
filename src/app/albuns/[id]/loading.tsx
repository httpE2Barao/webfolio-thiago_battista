import { GridSkeleton } from "@/components/LoadingStates";

export default function Loading() {
  return (
    <div className="lg:p-4 relative flex flex-col min-h-screen">
      {/* Skeleton for Title */}
      <div className="w-full max-w-xl mx-auto mb-2 flex flex-col items-center">
        <div className="h-10 w-64 bg-gray-900/50 animate-pulse rounded-full mb-2" />
        {/* Skeleton for Description */}
        <div className="h-4 w-96 bg-gray-900/30 animate-pulse rounded-full mb-2" />
        {/* Skeleton for count */}
        <div className="h-3 w-20 bg-gray-900/20 animate-pulse rounded-full mb-6" />
      </div>

      {/* Skeleton for Grid */}
      <GridSkeleton />
    </div>
  );
}
