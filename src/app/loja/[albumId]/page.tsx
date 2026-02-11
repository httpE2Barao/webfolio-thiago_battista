"use client";

import { ProtectedImage } from '@/components/ProtectedImage';
import { getThumbUrl } from '@/lib/cloudinaryOptimize';
import { StoreAlbum } from '@/types/types';
import Link from 'next/link';
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiChevronLeft, FiInfo, FiLock } from 'react-icons/fi';



export default function AlbumLojaPage({ params }: { params: Promise<{ albumId: string }> }) {
    const { albumId } = use(params);
    const [album, setAlbum] = useState<StoreAlbum | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [isAuthRequired, setIsAuthRequired] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
    const [error, setError] = useState('');

    const fetchAlbum = useCallback(async (pwd?: string) => {
        setIsLoading(true);
        setError('');
        try {
            const url = `/api/loja/album/${albumId}${pwd ? `?password=${pwd}` : ''}`;
            const res = await fetch(url);

            if (res.status === 403) {
                setIsAuthRequired(true);
                setIsLoading(false);
                return;
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erro ao carregar álbum');
            }

            const data = await res.json();
            setAlbum(data);
            setIsAuthRequired(false);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [albumId]);

    useEffect(() => {
        fetchAlbum();
    }, [fetchAlbum]);

    const togglePhoto = (id: string) => {
        const newSelected = new Set(selectedPhotos);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedPhotos(newSelected);
    };

    const currentPrice = useMemo(() => {
        if (!album) return 0;
        const count = selectedPhotos.size;
        if (count === 0) return 0;

        let price = album.basePrice;
        if (count > album.basePhotoLimit) {
            price += (count - album.basePhotoLimit) * album.extraPhotoPrice;
        }
        return price;
    }, [selectedPhotos.size, album]);

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        fetchAlbum(password);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white" />
            </div>
        );
    }

    if (isAuthRequired) {
        return (
            <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl text-center">
                    <FiLock className="text-5xl mx-auto mb-6 text-yellow-500" />
                    <h1 className="text-2xl font-bold mb-2">Álbum Privado</h1>
                    <p className="text-gray-400 mb-8 text-sm">Este álbum é protegido por senha. Por favor, insira a senha fornecida pelo fotógrafo.</p>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Digite a senha..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                            required
                        />
                        {error && <p className="text-red-500 text-xs">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Acessar Álbum
                        </button>
                    </form>

                    <Link href="/loja" className="inline-block mt-8 text-sm text-gray-500 hover:text-white transition-colors">
                        Voltar para a Loja
                    </Link>
                </div>
            </main>
        );
    }

    if (!album) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center flex-col gap-4">
                <p>Álbum não encontrado.</p>
                <Link href="/loja" className="text-blue-500">Voltar para a loja</Link>
            </div>
        );
    }

    return (
        <div className="selection:bg-white selection:text-black">

            {/* Sticky Top Bar for Progress */}
            <div className="fixed top-0 left-0 w-full z-40 bg-black/80 backdrop-blur-xl border-b border-white/10 mt-20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/loja" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <FiChevronLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-sm md:text-base font-bold truncate max-w-[150px] md:max-w-xs">{album.titulo}</h1>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{selectedPhotos.size} fotos selecionadas</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:block text-right">
                            <p className="text-xs text-gray-400 uppercase tracking-tighter">Total Estimado</p>
                            <p className="text-xl font-black">R$ {currentPrice.toFixed(2)}</p>
                        </div>

                        <button
                            disabled={selectedPhotos.size === 0}
                            className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm md:text-base hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-white/5"
                            onClick={() => {
                                // Ir para checkout
                                localStorage.setItem('selectedPhotos', JSON.stringify(Array.from(selectedPhotos)));
                                localStorage.setItem('albumId', album.id);
                                window.location.href = '/loja/checkout';
                            }}
                        >
                            CONCLUIR SELEÇÃO
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-48 pb-20 px-4 max-w-7xl mx-auto">
                {/* Info Card */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 mb-12 flex flex-col md:flex-row gap-6 items-start md:items-center">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <FiInfo className="text-white/40" />
                            Regras de Precificação
                        </h2>
                        <p className="text-sm text-gray-400">
                            Este álbum inclui até <strong>{album.basePhotoLimit} fotos</strong> por um preço fixo de <strong>R$ {(album.basePrice ?? 0).toFixed(2)}</strong>.
                            A cada foto adicional, será cobrado <strong>R$ {(album.extraPhotoPrice ?? 0).toFixed(2)}</strong>.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Mínimo</p>
                            <p className="font-bold">R$ {album.basePrice}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Adicional</p>
                            <p className="font-bold">R$ {album.extraPhotoPrice}</p>
                        </div>
                    </div>
                </div>

                {/* Galeria */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {album.Image.map((image, index) => (
                        <div
                            key={image.id}
                            className={`relative aspect-[3/4] group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 border-2 ${selectedPhotos.has(image.id) ? 'border-white' : 'border-transparent'
                                }`}
                            onClick={() => togglePhoto(image.id)}
                        >
                            <ProtectedImage
                                src={getThumbUrl(image.path, true)}
                                alt={`Foto ${index + 1}`}
                                fill
                                showOverlay={false}
                                className={`object-cover transition-transform duration-700 ${selectedPhotos.has(image.id) ? 'scale-110 opacity-60' : 'group-hover:scale-110 opacity-100'
                                    }`}
                            />

                            {/* Overlay Seleção */}
                            <div className={`absolute inset-0 z-20 flex items-center justify-center bg-black/20 transition-opacity ${selectedPhotos.has(image.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}>
                                {selectedPhotos.has(image.id) ? (
                                    <div className="bg-white text-black p-3 rounded-full shadow-2xl scale-110 transition-transform">
                                        <FiCheckCircle size={28} />
                                    </div>
                                ) : (
                                    <div className="border-2 border-white/50 w-10 h-10 rounded-full flex items-center justify-center">
                                        <div className="w-4 h-4 rounded-full bg-white/20" />
                                    </div>
                                )}
                            </div>

                            {/* Número da Foto */}
                            <div className="absolute bottom-4 left-4 z-30 text-[10px] font-mono text-white/50 bg-black/20 px-2 py-1 rounded">
                                #{index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
