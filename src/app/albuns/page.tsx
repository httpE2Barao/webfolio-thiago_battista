"use client";

import CustomSwiper from "@/components/CustomSwiper";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const dynamic = "force-dynamic";

export default function AlbunsPage() {

  return (
    <div>
      <CustomSwiper mode="shuffle" hidePagination={true} />
    </div>
  );
}