export interface Projeto {
  id: string;
  titulo: string;
  descricao: string;
  imagem: string;
  categoria?: string;
    tags?: string[];
  }

  export interface Projetos {
  [key: string]: Projeto[];
}