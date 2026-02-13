"use client";

import { ProtectedImage } from '@/components/ProtectedImage';
import { getAdminThumbUrl } from '@/lib/cloudinaryOptimize';
import React, { useRef, useState } from 'react';
import { FiArrowLeft, FiCheck, FiDollarSign, FiImage, FiLayout, FiLoader, FiMove, FiPlus, FiSave, FiTrash2, FiUpload, FiX } from 'react-icons/fi';
import { ImagePositionModal } from './ImagePositionModal';
import { Toggle } from './Toggle';

interface TabGerenciarAlbumProps {
    managedAlbum: any;
    managedImages: any[];
    setManagedAlbum: (album: any) => void;
    setManagedImages: (images: any[]) => void;
    setActiveTab: (tab: any) => void;
    handleSaveVenda: (albumId: string, data: any) => void;
    handleDeleteAlbum: (albumId: string) => void;
    handleDeletePhoto: (photoId: string) => void;
    handleSortPhotos: (albumId: string, images: any[]) => void;
    handleUpload: (e: React.FormEvent | React.ChangeEvent<any>, albumId?: string, files?: FileList | null) => void;
    setSelectedAlbumForCover: (album: any) => void;
    statusMessage: { type: string, text: string } | null;
    uploadProgress: number;
    categories: { id: string, name: string }[];
    tags: string[];
}

export const TabGerenciarAlbum = ({
    managedAlbum,
    managedImages,
    setManagedAlbum,
    setManagedImages,
    setActiveTab,
    handleSaveVenda,
    handleDeleteAlbum,
    handleDeletePhoto,
    handleSortPhotos,
    handleUpload,
    setSelectedAlbumForCover,
    statusMessage,
    uploadProgress,
    categories,
    tags
}: TabGerenciarAlbumProps) => {
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);

    // Tag handling logic
    const [tagInput, setTagInput] = useState('');

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = tagInput.trim();
            if (val && !managedAlbum.tags?.includes(val)) {
                const currentTags = managedAlbum.tags || [];
                setManagedAlbum({ ...managedAlbum, tags: [...currentTags, val] });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = managedAlbum.tags || [];
        setManagedAlbum({ ...managedAlbum, tags: currentTags.filter((t: string) => t !== tagToRemove) });
    };

    const handleSort = () => {
        // ... (keep sort logic)
        if (dragItem.current === null || dragOverItem.current === null) return;
        const _images = [...managedImages];
        const draggedItemContent = _images[dragItem.current];
        _images.splice(dragItem.current, 1);
        _images.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = dragOverItem.current;
        dragOverItem.current = null;
        setManagedImages(_images);
    };

    const handleSavePosition = async (posDesktop: string, posMobile: string) => {
        try {
            const res = await fetch(`/api/admin/albuns/${managedAlbum.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    coverImageDesktopPosition: posDesktop,
                    coverImageMobilePosition: posMobile
                })
            });

            if (res.ok) {
                setManagedAlbum({
                    ...managedAlbum,
                    coverImageDesktopPosition: posDesktop,
                    coverImageMobilePosition: posMobile
                });
            } else {
                console.error("Failed to save positions");
            }
        } catch (error) {
            console.error("Error saving positions", error);
        }
    };

    if (!managedAlbum) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header Sticky */}
            <div className="flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md py-4 border-b border-white/10 gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveTab('albuns')}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5"
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Gerenciar Album</h1>
                        <p className="text-[10px] text-gray-500 font-mono">{managedAlbum.titulo}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsPositionModalOpen(true)}
                        className="px-6 py-3 bg-purple-600/10 hover:bg-purple-600 text-purple-500 hover:text-white border border-purple-500/20 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
                        title="Ajustar foco da imagem de capa"
                    >
                        <FiMove /> Ajustar Recorte
                    </button>
                    <button
                        onClick={() => handleDeleteAlbum(managedAlbum.id)}
                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
                    >
                        <FiTrash2 /> Excluir Álbum
                    </button>
                    <button
                        onClick={() => handleSaveVenda(managedAlbum.id, managedAlbum)}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 shadow-xl shadow-blue-900/20"
                    >
                        <FiSave /> Salvar Alterações
                    </button>
                </div>
            </div>

            <ImagePositionModal
                isOpen={isPositionModalOpen}
                onClose={() => setIsPositionModalOpen(false)}
                imageUrlDesktop={getAdminThumbUrl(managedAlbum.coverImageDesktop || managedAlbum.coverImage || '')}
                imageUrlMobile={getAdminThumbUrl(managedAlbum.coverImageMobile || managedAlbum.coverImage || '')}
                initialPositionDesktop={managedAlbum.coverImageDesktopPosition}
                initialPositionMobile={managedAlbum.coverImageMobilePosition}
                onSave={handleSavePosition}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ... (rest of the content remains the same) */}
                {/* Lateral: Detalhes */}
                <div className="space-y-6">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                            <FiLayout className="text-blue-500" /> Detalhes Básicos
                        </h3>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-600 px-1">Título</label>
                            <input
                                value={managedAlbum.titulo || ''}
                                onChange={e => setManagedAlbum({ ...managedAlbum, titulo: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all font-bold"
                                placeholder="Título do álbum"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-600 px-1">Categoria</label>
                            <select
                                value={managedAlbum.categoria || ''}
                                onChange={e => setManagedAlbum({ ...managedAlbum, categoria: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all font-bold appearance-none text-gray-300"
                            >
                                <option value="" disabled>Selecione uma categoria...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-600 px-1">Tags (Enter para adicionar)</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {managedAlbum.tags?.map((tag: string) => (
                                    <span key={tag} className="bg-purple-500/10 text-purple-400 text-xs px-2 py-1 rounded-lg flex items-center gap-1 border border-purple-500/20">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="hover:text-white"><FiX /></button>
                                    </span>
                                ))}
                            </div>
                            <input
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-purple-500 outline-none transition-all font-bold"
                                placeholder="Adicionar tags..."
                                list="tags-suggestions"
                            />
                            <datalist id="tags-suggestions">
                                {tags.map(tag => (
                                    <option key={tag} value={tag} />
                                ))}
                            </datalist>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-600 px-1">Descrição</label>
                            <textarea
                                value={managedAlbum.descricao || ''}
                                onChange={e => setManagedAlbum({ ...managedAlbum, descricao: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-blue-500 outline-none transition-all min-h-[120px] font-medium"
                                placeholder="Uma breve descrição..."
                            />
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                            <FiDollarSign className="text-green-500" /> Comercial & Privacidade
                        </h3>

                        <div className="space-y-3">
                            <Toggle
                                label="Status de Venda"
                                subLabel={managedAlbum.isForSale ? "Álbum à venda" : "Apenas Portfólio"}
                                checked={managedAlbum.isForSale}
                                onChange={(val) => setManagedAlbum({ ...managedAlbum, isForSale: val })}
                                color="green"
                            />

                            <Toggle
                                label="Acesso Restrito"
                                subLabel={managedAlbum.isPrivate ? "Privado (com senha)" : "Público"}
                                checked={managedAlbum.isPrivate}
                                onChange={(val) => setManagedAlbum({ ...managedAlbum, isPrivate: val })}
                                color="purple"
                            />
                        </div>

                        {managedAlbum.isForSale && (
                            <div className="space-y-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-black text-gray-600 italic">Preço Base (R$)</label>
                                        <input type="number" value={managedAlbum.basePrice} onChange={e => setManagedAlbum({ ...managedAlbum, basePrice: parseFloat(e.target.value) })} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm font-bold" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] uppercase font-black text-gray-600 italic">Mínimo Fotos</label>
                                        <input type="number" value={managedAlbum.minPhotos} onChange={e => setManagedAlbum({ ...managedAlbum, minPhotos: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] uppercase font-black text-gray-600 italic">Preço Foto Extra (R$)</label>
                                    <input type="number" value={managedAlbum.extraPhotoPrice} onChange={e => setManagedAlbum({ ...managedAlbum, extraPhotoPrice: parseFloat(e.target.value) })} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-sm font-bold" />
                                </div>
                            </div>
                        )}

                        {managedAlbum.isPrivate && (
                            <div className="space-y-1 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[9px] uppercase font-black text-purple-400 tracking-widest">Senha de Acesso</label>
                                <input type="text" value={managedAlbum.accessPassword || ''} onChange={e => setManagedAlbum({ ...managedAlbum, accessPassword: e.target.value })} className="w-full bg-purple-500/5 border border-purple-500/20 p-3 rounded-xl text-sm font-mono text-purple-200" placeholder="Definir senha..." />
                            </div>
                        )}
                    </div>
                </div>

                {/* Principal: Fotos */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                    Fotos <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-400 font-mono tracking-normal">{managedImages.length}</span>
                                </h3>
                                <p className="text-[10px] text-gray-600 uppercase font-black italic tracking-widest mt-1">Arraste para reordenar</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleSortPhotos(managedAlbum.id, managedImages)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all"
                                >
                                    <FiCheck /> Salvar Ordem
                                </button>
                                <label className="cursor-pointer bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-gray-200 transition-all shadow-xl shadow-white/5">
                                    <FiUpload /> Adicionar
                                    <input type="file" multiple accept="image/*" onChange={(e) => handleUpload(e, managedAlbum.id, e.target.files)} className="hidden" />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {managedImages.map((img, index) => (
                                <div
                                    key={img.id}
                                    className={`relative group aspect-[3/4] bg-white/5 rounded-[1.25rem] overflow-hidden border-2 transition-all cursor-move ${managedAlbum.coverImageDesktop === img.path || managedAlbum.coverImageMobile === img.path ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-white/5 hover:border-white/20'}`}
                                    draggable
                                    onDragStart={(e) => {
                                        dragItem.current = index;
                                        e.dataTransfer.effectAllowed = "move";
                                        (e.target as HTMLDivElement).style.opacity = '0.4';
                                    }}
                                    onDragEnter={() => dragOverItem.current = index}
                                    onDragEnd={(e) => {
                                        (e.target as HTMLDivElement).style.opacity = '1';
                                        handleSort();
                                        dragItem.current = null;
                                        dragOverItem.current = null;
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <ProtectedImage
                                        src={getAdminThumbUrl(img.path)}
                                        alt="Foto"
                                        fill
                                        className="object-cover pointer-events-none"
                                    />

                                    <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur px-2 py-0.5 rounded-lg text-[8px] font-mono border border-white/10 text-gray-300">
                                        #{index + 1}
                                    </div>

                                    {(managedAlbum.coverImageDesktop === img.path || managedAlbum.coverImageMobile === img.path) && (
                                        <div className="absolute top-3 right-10 z-10 bg-blue-500 text-white px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-tight shadow-lg">
                                            CAPA
                                        </div>
                                    )}

                                    <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <button
                                            onClick={() => handleDeletePhoto(img.id)}
                                            className="bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-xl transition-all shadow-xl"
                                        >
                                            <FiTrash2 size={12} />
                                        </button>
                                        <button
                                            onClick={() => setSelectedAlbumForCover(managedAlbum)}
                                            className="bg-blue-500/90 hover:bg-blue-500 text-white p-2 rounded-xl transition-all shadow-xl"
                                        >
                                            <FiImage size={12} />
                                        </button>
                                    </div>

                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all">
                                        <div className="flex items-center justify-center gap-1.5 text-white/50">
                                            <FiMove size={10} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Mover</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <label className="border-4 border-dashed border-white/5 rounded-[1.25rem] aspect-[3/4] flex flex-col items-center justify-center gap-3 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group">
                                <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                                    <FiPlus className="text-gray-600" size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase text-gray-600 italic">Add Fotos</span>
                                <input type="file" multiple accept="image/*" onChange={(e) => handleUpload(e, managedAlbum.id, e.target.files)} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Float Notifications */}
            {statusMessage && (
                <div className={`fixed bottom-8 right-8 p-6 rounded-3xl border flex items-center justify-between gap-6 z-[100] shadow-2xl animate-in slide-in-from-right duration-500 ${statusMessage.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                    statusMessage.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                        'bg-red-500/10 border-red-500/20 text-red-500'
                    }`}>
                    <div className="flex items-center gap-4">
                        {statusMessage.type === 'info' && <FiLoader className="animate-spin" />}
                        <span className="text-xs font-black uppercase tracking-widest">{statusMessage.text}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
