"use client";

import { useState, useMemo, useEffect } from 'react';
import categories from '@/config/categories';

// Se a senha estiver em um arquivo .env.local, esta é a forma correta de acessá-la
const VALID_PASSWORD = process.env.NEXT_PUBLIC_VALID_PASSWORD;

export default function ConteudistaPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Estados do formulário
  const [albumName, setAlbumName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<keyof typeof categories | ''>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Pega as categorias principais para o primeiro dropdown
  const mainCategories = useMemo(() => Object.keys(categories) as (keyof typeof categories)[], []);

  // Deriva as subcategorias disponíveis quando uma categoria principal é selecionada
  const availableSubcategories = useMemo(() => 
    selectedCategoria ? Object.keys(categories[selectedCategoria]) : [],
    [selectedCategoria]
  );
  
  // Deriva todas as tags únicas do arquivo de categorias
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    Object.values(categories).forEach(subCatObject => {
      Object.values(subCatObject as Record<string, string>).forEach((tagString: string) => {
        tagString.split(',').forEach(tag => tag.trim() && tagSet.add(tag.trim()));
      });
    });
    return Array.from(tagSet).map(tag => tag.charAt(0).toUpperCase() + tag.slice(1));
  }, []);

  // Efeito para limpar o nome do álbum se a categoria principal mudar
  useEffect(() => {
    setAlbumName('');
  }, [selectedCategoria]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === VALID_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag) ? prevTags.filter(t => t !== tag) : [...prevTags, tag]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0 || !albumName) {
      alert('Por favor, preencha todos os campos e selecione pelo menos uma imagem.');
      return;
    }
    setIsSubmitting(true);
    setStatusMessage({ type: 'info', text: 'Enviando...' });

    const formData = new FormData();
    formData.append('albumName', albumName);
    formData.append('description', description);
    formData.append('categoria', selectedCategoria); 
    formData.append('subcategoria', albumName); // A subcategoria é o próprio nome do álbum
    selectedTags.forEach(tag => formData.append('tags', tag));
    Array.from(files).forEach(file => formData.append('files', file));

    try {
      const res = await fetch('/api/album-upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Álbum enviado com sucesso!' });
        // Limpar o formulário
        setAlbumName('');
        setDescription('');
        setSelectedCategoria('');
        setSelectedTags([]);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setStatusMessage({ type: 'error', text: `Erro: ${result.error || 'Erro desconhecido'}` });
      }
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="font-mono min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4">Área do Conteudista</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <label>
            Digite a senha:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 mt-1 text-black"
            />
          </label>
          <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="font-mono min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Upload de Álbuns</h1>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col gap-6">
        
        <label className="flex flex-col">
          Categoria Principal:
          <select 
            value={selectedCategoria} 
            onChange={(e) => setSelectedCategoria(e.target.value as keyof typeof categories | '')}
            className="border p-2 mt-1 text-black bg-white" required
          >
            <option value="">Selecione uma categoria...</option>
            {mainCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </label>
        
        <label className="flex flex-col">
          Subcategoria (Álbum):
          <select 
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            className="border p-2 mt-1 text-black bg-white" required
            disabled={!selectedCategoria}
          >
            <option value="">Selecione um álbum...</option>
            {availableSubcategories.map(subCat => <option key={subCat} value={subCat}>{subCat}</option>)}
          </select>
        </label>

        <label className="flex flex-col">
          Descrição do Álbum:
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 mt-1 text-black" rows={4} required />
        </label>
        
        <fieldset className="border p-4">
          <legend className="font-bold mb-2">Tags Disponíveis</legend>
          <div className="flex flex-wrap gap-4">
            {allTags.map((tag) => (
              <label key={tag} className="flex items-center gap-2">
                <input type="checkbox" checked={selectedTags.includes(tag)} onChange={() => handleTagChange(tag)} />
                {tag}
              </label>
            ))}
          </div>
        </fieldset>
        
        <label className="flex flex-col">
          Upload de Fotos:
          <input id="file-input" type="file" multiple onChange={handleFileChange} className="border p-2 mt-1" accept="image/*" required />
        </label>

        <button type="submit" disabled={isSubmitting} className="bg-green-500 text-white py-2 px-4 rounded disabled:bg-gray-400">
          {isSubmitting ? 'Enviando...' : 'Enviar Álbum'}
        </button>

        {statusMessage.text && (
          <div className={`p-4 rounded mt-4 text-center ${
            statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 
            statusMessage.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {statusMessage.text}
          </div>
        )}
      </form>
    </div>
  );
}