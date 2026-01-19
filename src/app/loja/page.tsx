"use client";

import { Header } from '@/components/Header';
import { getThumbUrl } from '@/lib/cloudinaryOptimize';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiLock, FiShoppingCart, FiUnlock } from 'react-icons/fi';

interface AlbumLoja {
    id: string;
    titulo: string;
    descricao: string | null;
    coverImage: string | null;
    isPrivate: boolean;
    basePrice: number;
    basePhotoLimit: number;
}

export default function LojaPage() {
    const [albuns, setAlbuns] = useState<AlbumLoja[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAlbuns() {
            try {
                const res = await fetch('/api/loja/albuns');
                const data = await res.json();
                setAlbuns(data);
            } catch (error) {
                console.error('Erro ao buscar álbuns:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAlbuns();
    }, []);

    return (
        <main className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
            <Header />

            <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">LOJA DE FOTOS</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Selecione seu álbum abaixo para visualizar e escolher suas fotos favoritas.
                        Oferecemos pacotes flexíveis para garantir suas melhores memórias.
                    </p>
                </header>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {albuns.map((album) => (
                            <Link
                                key={album.id}
                                href={`/loja/${album.id}`}
                                className="group relative bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500"
                            >
                                {/* Thumbnail */}
                                <div className="aspect-[3/2] relative overflow-hidden">
                                    {album.coverImage ? (
                                        <Image
                                            src={getThumbUrl(album.coverImage)}
                                            alt={album.titulo}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                                            <FiShoppingCart className="text-4xl text-white/20" />
                                        </div>
                                    )}

                                    {/* Badge de Preço */}
                                    <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded-full text-sm font-bold shadow-xl">
                                        A partir de R${album.basePrice ?? 0}
                                    </div>

                                    {/* Icone de Privacidade */}
                                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10">
                                        {album.isPrivate ? <FiLock className="text-white" /> : <FiUnlock className="text-white/40" />}
                                    </div>
                                </div>

                                {/* Conteúdo */}
                                <div className="p-6">
                                    <h2 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{album.titulo}</h2>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                        {album.descricao || 'Nenhuma descrição disponível.'}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                                        <span>{album.basePhotoLimit} fotos inclusas</span>
                                        {album.isPrivate && <span className="text-yellow-500/80">Álbum Privado</span>}
                                    </div>
                                </div>

                                {/* Overlay Hover */}
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </Link>
                        ))}
                    </div>
                )}

                {albuns.length === 0 && !isLoading && (
                    <div className="text-center py-20 bg-[#0a0a0a] rounded-2xl border border-dashed border-white/5">
                        <p className="text-gray-500">Nenhum álbum disponível para venda no momento.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
