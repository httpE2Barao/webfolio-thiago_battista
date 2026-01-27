export interface Projeto {
  id: string;
  titulo: string;
  descricao?: string;
  imagem: string;
  categoria?: string;
  subcategoria?: string;
  albumName?: string; // Usado para navegação
  coverImageMobile?: string;
  coverImageDesktop?: string;
}

// Ajuste aqui: se você quiser objetos com { id, imagem } em cada item do array
export interface Album {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  imagens: { id: string; imagem: string }[];
}

export type ProjetoArray = Projeto[];

export type Projetos = {
  [key: string]: {
    id: string;
    titulo: string;
    descricao: string;
    tags: string[];
    imagens: { id: string; imagem: string }[];
    categoria: string;
    subcategoria: string;
  };
};

export interface PageParams {
  id: string;
  categoria?: string;
}

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export interface PageProps<T = any> {
  params: Promise<T>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Aqui estava o problema: "imagens: string[];"
export interface AlbumData {
  id: string;
  titulo: string;
  descricao: string;
  imagens: { id: string; imagem: string }[];
  tags: string[];
}

export interface Categories {
  [category: string]: {
    [albumName: string]: string;
  };
}

export interface RandomizedTag {
  tagName: string;
  foto: {
    id: string;
    titulo: string;
    descricao?: string;
    imagem: string;
    categoria?: string;
    subcategoria?: string;
  };
}

export interface ProjetoComTag extends Projeto {
  tagName: string;
}

export interface Image {
  id: string;
  path: string;
  titulo?: string | null;
  descricao?: string | null;
  ordem: number;
}

export interface StoreAlbum {
  id: string;
  titulo: string;
  descricao?: string | null;
  basePrice: number;
  basePhotoLimit: number;
  extraPhotoPrice: number;
  isForSale: boolean;
  isPrivate: boolean;
  accessPassword?: string | null;
  categoria?: string;
  subcategoria?: string;
  coverImage?: string | null;
  tags?: string[];
  coverImageMobile?: string | null;
  coverImageDesktop?: string | null;
  Image: Image[];
}
