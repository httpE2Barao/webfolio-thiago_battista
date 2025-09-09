"use client";
import CustomSwiper from "@/components/CustomSwiper";

export default function HomePage() {
  return (
    <div className="h-[calc(100vh-5rem)] md:h-screen relative overflow-hidden">
      <CustomSwiper 
        mode="albuns"
        hidePagination={false}
      />
    </div>
  );
}