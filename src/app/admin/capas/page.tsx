"use client";

import Image from 'next/image';
import { useState } from 'react';

// VALID_PASSWORD constant removed for security - using server-side validation

interface ImageData {
    id: string;
    path: string;
    filename: string;
    ordem: number;
}

interface AlbumData {
    id: string;
    titulo: string;
    coverImage: string | null;
    coverImageMobile: string | null;
    coverImageDesktop: string | null;
    Image: ImageData[];
}

export default function AdminCapasPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [albums, setAlbums] = useState<AlbumData[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<AlbumData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [coverType, setCoverType] = useState<'desktop' | 'mobile'>('desktop');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (data.success) {
                setIsAuthenticated(true);
                fetchAlbums();
            } else {
                alert(data.error || 'Senha incorreta');
            }
        } catch (error) {
            alert('Erro ao validar senha');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAlbums = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/album-cover');
            const data = await res.json();
            setAlbums(data.albums || []);
        } catch (error) {
            console.error('Error fetching albums:', error);
            setStatusMessage({ type: 'error', text: 'Erro ao carregar álbuns' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetCover = async (albumId: string, imagePath: string) => {
        setIsLoading(true);
        setStatusMessage({ type: 'info', text: 'Salvando...' });

        try {
            const res = await fetch('/api/album-cover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ albumId, coverImagePath: imagePath, type: coverType }),
            });

            if (res.ok) {
                const data = await res.json();
                const updatedAlbumData = data.album;

                setStatusMessage({ type: 'success', text: `Capa ${coverType} atualizada com sucesso!` });

                // Update local state
                setAlbums(prev => prev.map(album =>
                    album.id === albumId ? {
                        ...album,
                        coverImage: updatedAlbumData.coverImage,
                        coverImageMobile: updatedAlbumData.coverImageMobile,
                        coverImageDesktop: updatedAlbumData.coverImageDesktop
                    } : album
                ));

                if (selectedAlbum?.id === albumId) {
                    setSelectedAlbum({
                        ...selectedAlbum,
                        coverImage: updatedAlbumData.coverImage,
                        coverImageMobile: updatedAlbumData.coverImageMobile,
                        coverImageDesktop: updatedAlbumData.coverImageDesktop
                    });
                }
            } else {
                setStatusMessage({ type: 'error', text: 'Erro ao atualizar capa' });
            }
        } catch (error) {
            console.error('Error setting cover:', error);
            setStatusMessage({ type: 'error', text: 'Erro de conexão' });
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="font-mono min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
                <h1 className="text-3xl font-bold mb-4">Gerenciador de Capas</h1>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <label>
                        Digite a senha:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border p-2 mt-1 text-black block w-full"
                        />
                    </label>
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
                        Entrar
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="font-mono min-h-screen p-4 bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-6">Gerenciador de Capas de Álbuns</h1>

            {statusMessage.text && (
                <div className={`p-4 rounded mb-4 ${statusMessage.type === 'success' ? 'bg-green-600' :
                    statusMessage.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                    }`}>
                    {statusMessage.text}
                </div>
            )}

            {isLoading && !albums.length && (
                <div className="text-center py-8">Carregando álbuns...</div>
            )}

            {selectedAlbum ? (
                // Album detail view for cover selection
                <div>
                    <button
                        onClick={() => setSelectedAlbum(null)}
                        className="mb-4 bg-gray-700 px-4 py-2 rounded hover:bg-gray-600"
                    >
                        ← Voltar para lista
                    </button>

                    <h2 className="text-2xl mb-4">{selectedAlbum.titulo}</h2>

                    <div className="bg-gray-800 p-4 rounded-lg mb-6 flex flex-col md:flex-row gap-4 items-center">
                        <span className="font-bold">Definir como:</span>
                        <div className="flex bg-gray-700 p-1 rounded-lg">
                            <button
                                onClick={() => setCoverType('desktop')}
                                className={`px-4 py-2 rounded-md transition-all ${coverType === 'desktop' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:text-white'}`}
                            >
                                Capa Desktop (Principal)
                            </button>
                            <button
                                onClick={() => setCoverType('mobile')}
                                className={`px-4 py-2 rounded-md transition-all ${coverType === 'mobile' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:text-white'}`}
                            >
                                Capa Mobile
                            </button>
                        </div>
                    </div>

                    <p className="mb-4 text-gray-400">
                        Clique em uma imagem para defini-la como <strong>capa {coverType}</strong>.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {selectedAlbum.Image.map((img) => {
                            const isDesktopCover = selectedAlbum.coverImageDesktop === img.path || (!selectedAlbum.coverImageDesktop && selectedAlbum.coverImage === img.path);
                            const isMobileCover = selectedAlbum.coverImageMobile === img.path;
                            const isSelectedTypeCover = coverType === 'desktop' ? isDesktopCover : isMobileCover;

                            return (
                                <div
                                    key={img.id}
                                    onClick={() => handleSetCover(selectedAlbum.id, img.path)}
                                    className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${isSelectedTypeCover ? 'border-blue-500 ring-2 ring-blue-400' : 'border-transparent hover:border-gray-500'
                                        }`}
                                >
                                    <Image
                                        src={img.path}
                                        alt={img.filename}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 50vw, 20vw"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 flex justify-center gap-1">
                                        {isDesktopCover && <span className="text-[10px] bg-blue-600 px-1 rounded" title="Desktop">D</span>}
                                        {isMobileCover && <span className="text-[10px] bg-green-600 px-1 rounded" title="Mobile">M</span>}
                                    </div>
                                    {isSelectedTypeCover && (
                                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-lg">
                                            ✓
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                // Albums list
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {albums.map((album) => (
                        <div
                            key={album.id}
                            onClick={() => setSelectedAlbum(album)}
                            className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors"
                        >
                            <div className="relative h-48">
                                <Image
                                    src={album.coverImage || album.Image[0]?.path || '/placeholder.jpg'}
                                    alt={album.titulo}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                                {album.coverImage && (
                                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                        Capa definida
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-lg">{album.titulo}</h3>
                                <p className="text-gray-400 text-sm">{album.Image.length} fotos</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
