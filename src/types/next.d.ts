
export type SearchParams = { [key: string]: string | string[] | undefined };

export interface PageProps {
  params: { id: string };
  searchParams?: SearchParams;
}

export interface GenerateMetadataProps {
  params: { id: string };
  searchParams?: SearchParams;
}

// src/types/next.d.ts

// As definições de PageProps e SearchParams foram movidas para types.ts
// para evitar conflitos de tipo durante o build.

// Este arquivo agora apenas declara os módulos de imagem.

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.avif' {
  const content: string;
  export default content;
}
