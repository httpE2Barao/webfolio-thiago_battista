export interface Projeto {
  id: string;
  titulo: string;
  descricao: string;
  imagem: string;
}

export interface Projetos {
  [categoria: string]: Projeto[];
}
