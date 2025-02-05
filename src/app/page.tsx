"use client";
import CustomSwiper from "@/components/CustomSwiper";

export default function HomePage() {
  return (
    <div className="h-screen">
      <CustomSwiper 
        mode="albuns"
        hidePagination={false}
      />
    </div>
  );
}
