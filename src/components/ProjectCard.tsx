import Image from "next/image";
import type { Projeto } from "@/types/types";

interface ProjectCardProps {
  projeto: Projeto;
  onClick?: () => void;
  className?: string;
}

export function ProjectCard({ projeto, onClick, className = "" }: ProjectCardProps) {
  const aspectRatio =
    projeto.imagem.includes("vertical") || projeto.imagem.includes("portrait")
      ? "2 / 3"
      : "4 / 3";

  return (
    <div
      className={`relative overflow-hidden rounded-md cursor-pointer ${className}`}
      style={{ aspectRatio }}
      onClick={onClick}
    >
      <Image
        src={projeto.imagem}
        alt={projeto.titulo}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
        className="object-cover transition-transform duration-300 hover:scale-105"
        priority
      />
    </div>
  );
}
