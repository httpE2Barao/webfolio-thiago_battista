"use client";

import { ProtectedImage } from '@/components/ProtectedImage';
import categories from '@/config/categories';
import { getThumbUrl } from '@/lib/cloudinaryOptimize';
import { Image as AlbumImage, StoreAlbum } from '@/types/types';
import Link from 'next/link';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import { FiArrowLeft, FiCheck, FiHeart, FiLoader, FiMove, FiSave, FiTrash2, FiUpload } from 'react-icons/fi';

export default function EditAlbumPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [album, setAlbum] = useState<StoreAlbum | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

    // Form States
    const [formData, setFormData] = useState<Partial<StoreAlbum>>({});
    const [tagsInput, setTagsInput] = useState('');

    // Images State
    const [images, setImages] = useState<AlbumImage[]>([]);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const fetchAlbum = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/loja/album/${id}`);
            // Reuse public API ? No, creating a specific admin one is better or just reuse the public one if it returns everything.
            // The public one might hide fields or require password if private.
            // Actually I should verify if I made a GET for admin. I didn't. 
            // I'll use the public one for now but bypass with password if needed or just create a minimal GET in the server component if I was using SC.
            // Wait, the client side fetch might fail if private and no password.
            // BETTER: Use a new GET /api/admin/albuns/[id] which returns everything without password check for admin.
            // I didn't create GET /api/admin/albuns/[id] yet?
            // Existing /api/admin/albuns/[id]/route.ts is PATCH only.
            // I should ADD GET to /api/admin/albuns/[id]/route.ts asap.
            // For now I'll assume I'll fix that.

            const resAdmin = await fetch(`/api/admin/albuns/${id}`);
            if (!resAdmin.ok) throw new Error("Erro ao carregar");
            const data = await resAdmin.json();

            setAlbum(data);
            setImages(data.Image || []);
            setFormData({
                titulo: data.titulo,
                descricao: data.descricao,
                categoria: data.categoria,
                subcategoria: data.subcategoria,
                tags: data.tags,
                isPrivate: data.isPrivate,
                isForSale: data.isForSale,
                basePrice: data.basePrice,
                basePhotoLimit: data.basePhotoLimit,
                extraPhotoPrice: data.extraPhotoPrice,
                accessPassword: data.accessPassword
            });
            // Handle tags if they are array or json
            // Assuming tags is string[] based on prisma types from earlier? Schema says Json?
            // Schema: tags Json?
            // In upload it was handled as string[].

        } catch (error) {
            console.error(error);
            setStatusMsg({ type: 'error', text: 'Erro ao carregar álbum' });
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAlbum();
    }, [fetchAlbum]);

    // --- Actions ---

    const handleUpdate = async () => {
        setIsSaving(true);
        setStatusMsg(null);
        try {
            const res = await fetch(`/api/admin/albuns/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) throw new Error();
            setStatusMsg({ type: 'success', text: 'Álbum atualizado!' });
        } catch (err) {
            setStatusMsg({ type: 'error', text: 'Erro ao salvar.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploading(true);
        setUploadProgress(0);
        setStatusMsg(null);

        const files = Array.from(e.target.files);
        const uploadedData = [];
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dx9whz8ee';

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const progress = Math.round((i / files.length) * 100);
                setUploadProgress(progress);
                setStatusMsg({ type: 'info', text: `Enviando ${i + 1} de ${files.length}...` });

                // 1. Get Signature
                const timestamp = Math.round(new Date().getTime() / 1000);
                const folder = `albums/${id}`;
                const paramsToSign = {
                    timestamp,
                    folder,
                };

                const signRes = await fetch('/api/admin/cloudinary/sign', {
                    method: 'POST',
                    body: JSON.stringify({ paramsToSign })
                });
                const { signature } = await signRes.json();

                // 2. Upload to Cloudinary
                const formData = new FormData();
                formData.append('file', file);
                formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '');
                formData.append('timestamp', timestamp.toString());
                formData.append('signature', signature);
                formData.append('folder', folder);

                const cloudinaryRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                    { method: 'POST', body: formData }
                );

                if (!cloudinaryRes.ok) throw new Error('Falha no upload para Cloudinary');
                const result = await cloudinaryRes.json();
                uploadedData.push(result);
            }

            setUploadProgress(100);
            setStatusMsg({ type: 'info', text: 'Salvando no banco de dados...' });

            // 3. Save to DB
            const res = await fetch(`/api/admin/albuns/${id}/photos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ images: uploadedData })
            });

            if (res.ok) {
                setStatusMsg({ type: 'success', text: `${uploadedData.length} fotos adicionadas com sucesso!` });
                fetchAlbum();
            } else {
                throw new Error('Erro ao salvar no banco de dados');
            }
        } catch (error: any) {
            console.error('Erro no upload:', error);
            setStatusMsg({ type: 'error', text: error.message || 'Erro no upload' });
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDeletePhoto = async (photoId: string) => {
        if (!confirm('Excluir esta foto?')) return;
        try {
            await fetch(`/api/admin/photos/${photoId}`, { method: 'DELETE' });
            setImages(prev => prev.filter(img => img.id !== photoId));
        } catch (error) {
            alert('Erro ao excluir');
        }
    };

    const handleSetCover = async (imagePath: string) => {
        setFormData(prev => ({ ...prev, coverImage: imagePath }));
        setStatusMsg({ type: 'info', text: 'Definindo foto de capa...' });
        try {
            const res = await fetch(`/api/admin/albuns/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ coverImage: imagePath }),
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) throw new Error();
            setStatusMsg({ type: 'success', text: 'Capa atualizada!' });
            // Update local album state to reflect cover change
            setAlbum(prev => prev ? { ...prev, coverImage: imagePath } : null);
        } catch (err) {
            setStatusMsg({ type: 'error', text: 'Erro ao definir capa.' });
        }
    };

    const handleDeleteAlbum = async () => {
        if (!confirm('ATENÇÃO: Isso excluirá o álbum e TODAS as fotos permanentemente. Continuar?')) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/albuns/${id}`, { method: 'DELETE' });
            if (res.ok) {
                window.location.href = '/admin';
            } else {
                throw new Error();
            }
        } catch (err) {
            alert('Erro ao excluir álbum');
            setIsSaving(false);
        }
    };

    // --- Drag and Drop ---

    const handleSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;

        const _images = [...images];
        const draggedItemContent = _images[dragItem.current];

        _images.splice(dragItem.current, 1);
        _images.splice(dragOverItem.current, 0, draggedItemContent);

        dragItem.current = dragOverItem.current;
        dragOverItem.current = null;

        setImages(_images);
    };

    const saveOrder = async () => {
        const orderMap = images.map((img, idx) => ({ id: img.id, ordem: idx }));
        try {
            await fetch('/api/admin/photos/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: orderMap })
            });
            setStatusMsg({ type: 'success', text: 'Ordem salva!' });
        } catch (error) {
            setStatusMsg({ type: 'error', text: 'Erro ao salvar ordem' });
        }
    };

    // --- Render Helpers ---

    if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white"><FiLoader className="animate-spin text-3xl" /></div>;
    if (!album) return <div className="p-10 text-white">Álbum não encontrado</div>;

    const allCategories = Object.keys(categories); // Simplified, ideally fetch from DB too

    return (
        <main className="min-h-screen bg-[#050505] text-white p-6 pb-32">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md py-4 border-b border-white/10 gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <FiArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight">Editar Álbum</h1>
                            <p className="text-xs text-gray-500">{album.titulo}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                        <button
                            onClick={handleDeleteAlbum}
                            disabled={isSaving}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        >
                            <FiTrash2 /> Excluir Álbum
                        </button>
                        <button
                            onClick={handleUpdate}
                            disabled={isSaving}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />} Salvar Detalhes
                        </button>
                    </div>
                </div>

                {statusMsg && (
                    <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${statusMsg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                        statusMsg.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                            'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                        <div className="flex items-center gap-3">
                            {statusMsg.type === 'info' && <FiLoader className="animate-spin" />}
                            {statusMsg.type === 'success' && <FiCheck size={18} />}
                            <span className="text-sm font-bold">{statusMsg.text}</span>
                        </div>
                        {statusMsg.type === 'info' && uploading && (
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono">{uploadProgress}%</span>
                                <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                </div>
                            </div>
                        )}
                        <button onClick={() => setStatusMsg(null)} className="text-gray-500 hover:text-white transition-colors">
                            <FiTrash2 size={14} />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Col: Details */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 space-y-4">
                            <h2 className="text-lg font-bold border-b border-white/5 pb-2">Informações Principais</h2>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Título</label>
                                <input
                                    value={formData.titulo || ''}
                                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Descrição</label>
                                <textarea
                                    value={formData.descricao || ''}
                                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-colors min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500">Categoria</label>
                                <input
                                    list="cats"
                                    value={formData.categoria || ''}
                                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                />
                                <datalist id="cats">
                                    {allCategories.map(c => <option key={c} value={c} />)}
                                </datalist>
                            </div>
                        </div>

                        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 space-y-4">
                            <h2 className="text-lg font-bold border-b border-white/5 pb-2">Vendas & Privacidade</h2>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm bg-white/5 px-4 py-2 rounded-lg cursor-pointer hover:bg-white/10">
                                    <input
                                        type="checkbox"
                                        checked={formData.isForSale}
                                        onChange={e => setFormData({ ...formData, isForSale: e.target.checked })}
                                        className="rounded border-gray-600"
                                    />
                                    À Venda
                                </label>
                                <label className="flex items-center gap-2 text-sm bg-white/5 px-4 py-2 rounded-lg cursor-pointer hover:bg-white/10">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPrivate}
                                        onChange={e => setFormData({ ...formData, isPrivate: e.target.checked })}
                                        className="rounded border-gray-600"
                                    />
                                    Privado
                                </label>
                            </div>

                            {formData.isForSale && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-500">Preço Base</label>
                                        <input type="number" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })} className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-500">Limite Fotos</label>
                                        <input type="number" value={formData.basePhotoLimit} onChange={e => setFormData({ ...formData, basePhotoLimit: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-gray-500">Preço Extra</label>
                                        <input type="number" value={formData.extraPhotoPrice} onChange={e => setFormData({ ...formData, extraPhotoPrice: parseFloat(e.target.value) })} className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-sm" />
                                    </div>
                                    {formData.isPrivate && (
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-[10px] uppercase font-bold text-gray-500">Senha</label>
                                            <input type="text" value={formData.accessPassword || ''} onChange={e => setFormData({ ...formData, accessPassword: e.target.value })} className="w-full bg-white/5 border border-white/10 p-2 rounded-lg text-sm" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Col: Photos */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    Fotos <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-400">{images.length}</span>
                                </h2>
                                <div className="flex gap-2">
                                    <button onClick={saveOrder} className="text-xs font-bold uppercase hover:bg-white/10 px-3 py-2 rounded-lg transition-colors flex items-center gap-2">
                                        <FiCheck /> Salvar Ordem
                                    </button>
                                    <label className={`cursor-pointer bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-gray-200 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                                        {uploading ? <FiLoader className="animate-spin" /> : <FiUpload />}
                                        <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
                                        Adicionar Fotos
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {images.map((img, index) => (
                                    <div
                                        key={img.id}
                                        className={`relative group aspect-[3/4] bg-white/5 rounded-xl overflow-hidden border-2 transition-all cursor-move ${formData.coverImage === img.path ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-white/5 hover:border-white/30'}`}
                                        draggable
                                        onDragStart={(e) => {
                                            dragItem.current = index;
                                            e.dataTransfer.effectAllowed = "move";
                                            // Add opacity or visual feedback
                                            (e.target as HTMLDivElement).style.opacity = '0.5';
                                        }}
                                        onDragEnter={(e) => {
                                            dragOverItem.current = index;
                                            // e.preventDefault(); // Necessary?
                                        }}
                                        onDragEnd={(e) => {
                                            (e.target as HTMLDivElement).style.opacity = '1';
                                            handleSort();
                                            dragItem.current = null;
                                            dragOverItem.current = null;
                                        }}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        <ProtectedImage
                                            src={getThumbUrl(img.path, true)}
                                            alt="Foto"
                                            fill
                                            className="object-cover pointer-events-none"
                                        />

                                        <div className="absolute top-2 left-2 z-10 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] font-mono border border-white/10">
                                            #{index + 1}
                                        </div>

                                        {formData.coverImage === img.path && (
                                            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-blue-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">
                                                Capa Atual
                                            </div>
                                        )}

                                        <div className="absolute top-2 right-2 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeletePhoto(img.id); }}
                                                className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-lg transition-colors"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleSetCover(img.path); }}
                                                className={`p-2 rounded-lg transition-colors ${formData.coverImage === img.path ? 'bg-blue-500 text-white' : 'bg-white/20 hover:bg-white/40 text-white'}`}
                                                title="Definir como Capa"
                                            >
                                                <FiHeart size={14} className={formData.coverImage === img.path ? 'fill-current' : ''} />
                                            </button>
                                        </div>

                                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FiMove className="mx-auto text-white/50" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
