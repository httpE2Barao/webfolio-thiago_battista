import { CategorySlatSkeleton } from "@/components/LoadingStates";

export default function Loading() {
    return (
        <div className="p-4 md:p-8">
            <CategorySlatSkeleton />
        </div>
    );
}
