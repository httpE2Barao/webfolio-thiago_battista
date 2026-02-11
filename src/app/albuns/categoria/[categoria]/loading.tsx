import { CardsEffectSkeleton } from "@/components/LoadingStates";

export default function Loading() {
  return (
    <div className="space-y-20 py-12 px-4 md:px-12 max-w-[1400px] mx-auto">
      <div className="h-16 w-64 bg-gray-900 animate-pulse rounded-lg mx-auto mb-24" />
      <CardsEffectSkeleton />
    </div>
  );
}
