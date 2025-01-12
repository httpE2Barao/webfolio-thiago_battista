import Image from "next/image";
import type { Projeto } from "../data/types";

interface ProjectCardProps {
  projeto: Projeto;
}

export function ProjectCard({ projeto }: ProjectCardProps) {
  // Verifica se a imagem é mais provável de ser vertical ou horizontal
  const aspectRatio =
    projeto.imagem.includes("vertical") || projeto.imagem.includes("portrait")
      ? "2 / 3"
      : "4 / 3";

  return (
    <div
      className="relative overflow-hidden rounded-md"
      style={{
        aspectRatio: aspectRatio, // Define a proporção
      }}
    >
      <Image
        src={projeto.imagem}
        alt={projeto.titulo}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
        className="object-cover"
      />
    </div>
  );
}
