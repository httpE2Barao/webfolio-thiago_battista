"use client"

import { useState } from 'react';
import categories from '@/config/categories';

const VALID_PASSWORD = process.env.NEXT_PUBLIC_VALID_PASSWORD;

export default function ConteudistaPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // Form states
  const [albumName, setAlbumName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);

  // Gera dinamicamente as tags a partir das chaves de categories.
  // Você pode ajustar a formatação (por exemplo, capitalizar a primeira letra)
  const tags = Object.keys(categories).map(tag =>
    tag.charAt(0).toUpperCase() + tag.slice(1)
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === VALID_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta');
    }
  };

  const handleTagChange = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('albumName', albumName);
    formData.append('description', description);
    // Append each selected tag
    selectedTags.forEach(tag => formData.append('tags', tag));
    
    if (files) {
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
    }

    try {
      const res = await fetch('/api/album-upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        alert('Álbum enviado e projetos regenerados com sucesso!');
      } else {
        alert('Erro ao enviar álbum');
      }
    } catch (error) {
      console.error(error);
      alert('Erro na requisição');
    }

    // Reset form after submission
    setAlbumName('');
    setDescription('');
    setSelectedTags([]);
    setFiles(null);
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
              className="border p-2 mt-1"
              style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}
            />
          </label>
          <button type="submit" className="py-2 px-4 rounded text-white"
                  style={{ backgroundColor: 'var(--button-primary)' }}>Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="font-mono min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Upload de Álbuns</h1>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col gap-6">
        <label className="flex flex-col">
          Nome do Álbum:
          <input
            type="text"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            className="border p-2 mt-1"
              style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}
            required
          />
        </label>
        <label className="flex flex-col">
          Descrição do Álbum:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 mt-1"
              style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}
            rows={4}
            required
          />
        </label>
        <fieldset className="border p-4">
          <legend className="font-bold mb-2">Tags Disponíveis</legend>
          <div className="flex flex-wrap gap-4">
            {tags.map((tag) => (
              <label key={tag} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex flex-col">
          Upload de Fotos:
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="border p-2 mt-1"
            accept="image/*"
            required
          />
        </label>
        <button type="submit" className="py-2 px-4 rounded text-white"
                style={{ backgroundColor: 'var(--button-success)' }}>Enviar Álbum</button>
      </form>
    </div>
  );
}
