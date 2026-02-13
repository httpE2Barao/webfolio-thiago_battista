"use client";

import { ProtectedImage } from '@/components/ProtectedImage';
import categories from '@/config/categories';
import { compressImage } from '@/lib/image-compression';
import { getThumbUrl } from '@/lib/cloudinaryOptimize';
import { Image as AlbumImage, StoreAlbum } from '@/types/types';
import Link from 'next/link';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import { FiActivity, FiArrowLeft, FiCheck, FiImage, FiLoader, FiMove, FiSave, FiTrash2, FiUpload, FiX } from 'react-icons/fi';

export default function EditAlbumPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [album, setAlbum] = useState<StoreAlbum | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
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
        const savedPassword = localStorage.getItem('admin_password');
        if (savedPassword) {
            validatePassword(savedPassword);
        } else {
            setIsCheckingAuth(false);
        }
    }, []);

    async function validatePassword(password: string) {
        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (data.success) {
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Erro ao validar acesso:', error);
        } finally {
            setIsCheckingAuth(false);
        }
    }

    useEffect(() => {
        if (isAuthenticated) {
            fetchAlbum();
        }
    }, [fetchAlbum, isAuthenticated]);

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
                setStatusMsg({ type: 'info', text: `Comprimindo e enviando ${i + 1} de ${files.length}...` });

                // Compression Step
                const originalFile = file;
                let fileToUpload = originalFile;

                try {
                    if (originalFile.size > 5 * 1024 * 1024) {
                        fileToUpload = await compressImage(originalFile);
                    }
                } catch (err) {
                    console.error("Compression failed, using original", err);
                }

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
                formData.append('file', fileToUpload);
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
            await fetch(`/api/admin/photos?id=${encodeURIComponent(photoId)}`, { method: 'DELETE' });
            setImages(prev => prev.filter(img => img.id !== photoId));
        } catch (error) {
            alert('Erro ao excluir');
        }
    };

    const [selectedAlbumForCover, setSelectedAlbumForCover] = useState<{
        id: string,
        titulo: string,
        coverImageDesktop?: string | null,
        coverImageMobile?: string | null,
        coverImageDesktopPosition?: string | null,
        coverImageMobilePosition?: string | null
    } | null>(null);
    const [coverType, setCoverType] = useState<'desktop' | 'mobile'>('desktop');

    const handleSetCover = async (imagePath: string, position?: string) => {
        setStatusMsg({ type: 'info', text: `Definindo capa ${coverType}...` });
        try {
            const res = await fetch('/api/album-cover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    albumId: id,
                    coverImagePath: imagePath,
                    type: coverType,
                    position: position || (coverType === 'desktop' ? formData.coverImageDesktopPosition : formData.coverImageMobilePosition) || 'center'
                }),
            });

            if (!res.ok) throw new Error();
            const data = await res.json();

            // Atualiza o estado local do formulário
            setFormData(prev => ({
                ...prev,
                coverImage: data.album.coverImage,
                coverImageDesktop: data.album.coverImageDesktop,
                coverImageMobile: data.album.coverImageMobile,
                coverImageDesktopPosition: data.album.coverImageDesktopPosition,
                coverImageMobilePosition: data.album.coverImageMobilePosition
            }));

            // Atualiza o estado para o modal se ele estiver aberto
            if (selectedAlbumForCover) {
                setSelectedAlbumForCover({
                    ...selectedAlbumForCover,
                    coverImageDesktop: data.album.coverImageDesktop,
                    coverImageMobile: data.album.coverImageMobile,
                    coverImageDesktopPosition: data.album.coverImageDesktopPosition,
                    coverImageMobilePosition: data.album.coverImageMobilePosition
                } as any);
            }

            setStatusMsg({ type: 'success', text: `Capa ${coverType} atualizada!` });
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

    if (isCheckingAuth) return <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-4"><FiActivity className="animate-pulse text-blue-500 text-3xl" /><p className="animate-pulse font-black uppercase text-xs">Validando Acesso...</p></div>;

    if (!isAuthenticated) {
        if (typeof window !== 'undefined') window.location.href = '/admin';
        return null;
    }

    if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white"><FiLoader className="animate-spin text-3xl" /></div>;
    if (!album) return <div className="p-10 text-white">Álbum não encontrado</div>;

    const allCategories = Object.keys(categories); // Simplified, ideally fetch from DB too

    return (
        <div className="p-6 pb-32 selection:bg-white selection:text-black">
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
                                        <label className="text-[10px] uppercase font-bold text-gray-500">Mínimo Fotos</label>
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedAlbumForCover(album as any);
                                                }}
                                                className={`p-2 rounded-lg transition-colors ${formData.coverImageDesktop === img.path || formData.coverImageMobile === img.path ? 'bg-blue-500 text-white' : 'bg-white/20 hover:bg-white/40 text-white'}`}
                                                title="Gerenciar Capas"
                                            >
                                                <FiImage size={14} />
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
            {/* Modal de Capas Integrado */}
            {selectedAlbumForCover && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-6xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
                        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pr-16 md:pr-16">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold">Gerenciar Capas: {selectedAlbumForCover.titulo}</h2>
                                <div className="flex flex-wrap gap-4 mt-3">
                                    <div className="flex gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                                        <button onClick={() => setCoverType('desktop')} className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full transition-all ${coverType === 'desktop' ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}>Desktop</button>
                                        <button onClick={() => setCoverType('mobile')} className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full transition-all ${coverType === 'mobile' ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}>Mobile</button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] uppercase font-black text-gray-500">Alinhamento:</span>
                                        <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                                            {['top', 'center', 'bottom'].map((pos) => {
                                                const currentPos = coverType === 'desktop' ? formData.coverImageDesktopPosition : formData.coverImageMobilePosition;
                                                const active = (currentPos || 'center') === pos;
                                                const label = pos === 'top' ? 'Topo' : pos === 'center' ? 'Centro' : 'Base';

                                                return (
                                                    <button
                                                        key={pos}
                                                        onClick={() => {
                                                            const currentPath = coverType === 'desktop' ? formData.coverImageDesktop : formData.coverImageMobile;
                                                            if (currentPath) handleSetCover(currentPath, pos);
                                                        }}
                                                        className={`text-[9px] font-bold px-3 py-1 rounded-lg transition-all ${active ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-white/5'}`}
                                                    >
                                                        {label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedAlbumForCover(null)}
                            className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all z-20 border border-white/10"
                            title="Fechar"
                        >
                            <FiX size={24} />
                        </button>
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {images.map((photo) => {
                                    const isCurrentCover = coverType === 'desktop'
                                        ? formData.coverImageDesktop === photo.path
                                        : formData.coverImageMobile === photo.path;
                                    return (
                                        <div
                                            key={photo.id}
                                            onClick={() => handleSetCover(photo.path)}
                                            className={`relative aspect-square cursor-pointer rounded-xl overflow-hidden group border-2 transition-all ${isCurrentCover ? 'border-white' : 'border-transparent hover:border-white/30'}`}
                                        >
                                            <img
                                                src={getThumbUrl(photo.path, true)}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                style={{ objectPosition: isCurrentCover ? (coverType === 'desktop' ? formData.coverImageDesktopPosition : formData.coverImageMobilePosition) || 'center' : 'center' }}
                                                loading="lazy"
                                            />
                                            {isCurrentCover && (
                                                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                                    <div className="bg-white text-black text-[8px] font-black px-2 py-1 rounded shadow-xl flex flex-col items-center gap-1">
                                                        <span>ATUAL</span>
                                                        <span className="text-[6px] opacity-50 uppercase">{(coverType === 'desktop' ? formData.coverImageDesktopPosition : formData.coverImageMobilePosition) || 'center'}</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                <span className="text-[10px] font-black uppercase">{isCurrentCover ? 'Trocar Alinhamento' : 'Definir'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
