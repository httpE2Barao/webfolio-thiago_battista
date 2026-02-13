import categories from '@/config/categories';
import { compressImage } from '@/lib/image-compression';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface AlbumSalesConfig {
    id: string;
    titulo: string;
    isForSale: boolean;
    isPrivate: boolean;
    accessPassword?: string;
    basePrice: number;
    basePhotoLimit: number;
    extraPhotoPrice: number;
    coverImage?: string;
    coverImageDesktop?: string;
    coverImageMobile?: string;
    coverImageDesktopPosition?: string;
    coverImageMobilePosition?: string;
    categoria?: string;
    _count?: { Image: number };
}

export interface Order {
    id: string;
    customerName: string;
    customerEmail: string;
    totalPhotos: number;
    totalPrice: number;
    status: string;
    createdAt: string;
    Album?: { titulo: string };
}

export type TabType = 'overview' | 'albuns' | 'create_album' | 'list_albuns' | 'taxonomia' | 'pedidos' | 'gerenciar_album';

export function useAdminData() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authPassword, setAuthPassword] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Estados - Geral
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    // Estados - Upload
    const [albumName, setAlbumName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategoria, setSelectedCategoria] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [files, setFiles] = useState<FileList | null>(null);
    const [isPrivateUpload, setIsPrivateUpload] = useState(false);
    const [accessPasswordUpload, setAccessPasswordUpload] = useState('');
    const [basePriceUpload, setBasePriceUpload] = useState(200);
    const [baseLimitUpload, setBaseLimitUpload] = useState(10);
    const [extraPriceUpload, setExtraPriceUpload] = useState(50);
    const [statusMessage, setStatusMessage] = useState<{ type: string; text: string } | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Estados - Vendas & Pedidos
    const [albuns, setAlbuns] = useState<AlbumSalesConfig[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<AlbumSalesConfig>>({});

    // Estados - Categorias & Tags do Banco
    const [dbCategories, setDbCategories] = useState<{ id: string, name: string, ordem: number }[]>([]);
    const [dbTags, setDbTags] = useState<{ id: string, name: string, ordem: number }[]>([]);

    const [selectedAlbumForCover, setSelectedAlbumForCover] = useState<AlbumSalesConfig | any | null>(null);
    const [coverType, setCoverType] = useState<'desktop' | 'mobile'>('desktop');
    const [albumPhotos, setAlbumPhotos] = useState<any[]>([]);
    const [isPhotoLoading, setIsPhotoLoading] = useState(false);

    // Estado para Gerenciamento de Álbum Único (Migrado da EditAlbumPage)
    const [managedAlbum, setManagedAlbum] = useState<AlbumSalesConfig | null>(null);
    const [managedImages, setManagedImages] = useState<any[]>([]);

    // Derivados
    const allCategoriesList = useMemo(() => {
        const staticCats = Object.keys(categories);
        const dbCatNames = Array.isArray(dbCategories) ? dbCategories.map(c => c.name) : [];
        return Array.from(new Set([...staticCats, ...dbCatNames])).sort();
    }, [dbCategories]);

    const allTagsList = useMemo(() => {
        const tagSet = new Set<string>();

        // Helper to normalize tag: Trim and Capitalize first letter
        const normalize = (t: string) => {
            const trimmed = t.trim();
            if (!trimmed) return null;
            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
        };

        Object.values(categories).forEach((subCatObject: any) => {
            Object.values(subCatObject).forEach((tagString: any) => {
                tagString.split(',').forEach((tag: string) => {
                    const n = normalize(tag);
                    if (n) tagSet.add(n);
                });
            });
        });

        if (Array.isArray(dbTags)) {
            dbTags.forEach(tag => {
                const n = normalize(tag.name);
                if (n) tagSet.add(n);
            });
        }

        selectedTags.forEach(tag => {
            const n = normalize(tag);
            if (n) tagSet.add(n);
        });

        return Array.from(tagSet).sort();
    }, [dbTags, selectedTags]);

    const stats = useMemo(() => {
        return {
            totalAlbuns: albuns.length,
            totalPhotos: albuns.reduce((acc, alb) => acc + (alb._count?.Image || 0), 0),
            totalOrders: orders.length,
            totalRevenue: orders.reduce((acc, ord) => acc + ord.totalPrice, 0)
        };
    }, [albuns, orders]);

    const fetchAdminData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [albunsRes, ordersRes, catsRes, tagsRes] = await Promise.all([
                fetch('/api/admin/albuns'),
                fetch('/api/admin/orders'),
                fetch('/api/admin/categories'),
                fetch('/api/admin/tags')
            ]);
            const albunsData = await albunsRes.json();
            const ordersData = await ordersRes.json();
            const catsData = await catsRes.json();
            const tagsData = await tagsRes.json();

            setAlbuns(Array.isArray(albunsData) ? albunsData : []);
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            setDbCategories(Array.isArray(catsData) ? catsData : []);
            setDbTags(Array.isArray(tagsData) ? tagsData : []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const validatePassword = useCallback(async (password: string) => {
        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (data.success) {
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem('admin_password');
            }
        } catch (error) {
            console.error('Erro ao validar login persistente:', error);
        } finally {
            setIsCheckingAuth(false);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: authPassword })
            });
            const data = await res.json();
            if (data.success) {
                setIsAuthenticated(true);
                localStorage.setItem('admin_password', authPassword);
            } else {
                alert(data.error || 'Senha incorreta');
            }
        } catch (error) {
            alert('Erro ao validar senha. Verifique sua conexão.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setAuthPassword('');
        localStorage.removeItem('admin_password');
    };

    const handleTagChange = (tag: string) => {
        const normalizedTag = tag.trim();
        if (!normalizedTag) return;

        setSelectedTags(prevTags => {
            const exists = prevTags.some(t => t.toLowerCase() === normalizedTag.toLowerCase());
            if (exists) {
                return prevTags.filter(t => t.toLowerCase() !== normalizedTag.toLowerCase());
            }
            return [...prevTags, normalizedTag];
        });
    };

    const handleUpload = async (e: React.FormEvent, albumIdTarget?: string) => {
        e.preventDefault();
        const targetId = albumIdTarget || '';
        const isNewAlbum = !targetId;

        if (!files || files.length === 0 || (isNewAlbum && !albumName)) {
            alert('Preencha os campos e selecione imagens.');
            return;
        }
        setIsLoading(true);
        setStatusMessage({ type: 'info', text: isNewAlbum ? 'Criando álbum...' : 'Enviando fotos...' });

        try {
            let finalAlbumId = targetId;

            if (isNewAlbum) {
                const albumData = new FormData();
                albumData.append('albumName', albumName);
                albumData.append('description', description);
                albumData.append('categoria', selectedCategoria);
                albumData.append('subcategoria', albumName);
                albumData.append('isPrivate', String(isPrivateUpload));
                albumData.append('accessPassword', accessPasswordUpload);
                albumData.append('basePrice', String(basePriceUpload));
                albumData.append('basePhotoLimit', String(baseLimitUpload));
                albumData.append('extraPhotoPrice', String(extraPriceUpload));
                selectedTags.forEach(tag => albumData.append('tags', tag));

                const createRes = await fetch('/api/admin/albuns/create', {
                    method: 'POST',
                    body: albumData,
                });

                const createResult = await createRes.json();
                if (!createRes.ok) throw new Error(createResult.error || 'Erro ao criar álbum');
                finalAlbumId = createResult.albumId;
            }

            const fileArray = Array.from(files);
            let successCount = 0;
            setUploadProgress(0);

            for (let i = 0; i < fileArray.length; i++) {
                setUploadProgress(Math.round(((i) / fileArray.length) * 100));
                setStatusMessage({ type: 'info', text: `Comprimindo e enviando ${i + 1} de ${fileArray.length}...` });

                // Compression Step
                const originalFile = fileArray[i];
                let fileToUpload = originalFile;

                try {
                    if (originalFile.size > 5 * 1024 * 1024) {
                        fileToUpload = await compressImage(originalFile);
                    }
                } catch (err) {
                    console.error("Compression failed, using original", err);
                }

                const uploadData = new FormData();
                uploadData.append('albumId', finalAlbumId);
                uploadData.append('file', fileToUpload);
                uploadData.append('order', String(i));

                const uploadRes = await fetch('/api/admin/albuns/upload', {
                    method: 'POST',
                    body: uploadData,
                });

                if (!uploadRes.ok) {
                    throw new Error(`Imagem ${i + 1}: Erro no envio`);
                } else {
                    successCount++;
                }
            }

            setUploadProgress(100);
            setStatusMessage({ type: 'success', text: `${isNewAlbum ? 'Álbum criado' : 'Fotos adicionadas'} com sucesso! ${successCount} imagens enviadas.` });

            if (isNewAlbum) {
                setAlbumName('');
                setDescription('');
                setSelectedCategoria('');
                setSelectedTags([]);
            }
            setFiles(null);
            fetchAdminData();
            if (managedAlbum?.id === finalAlbumId) refreshAlbumPhotos(finalAlbumId);
        } catch (error: any) {
            console.error(error);
            setStatusMessage({ type: 'error', text: `Erro: ${error.message || 'Erro desconhecido'}` });
        } finally {
            setIsLoading(false);
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    const startEdit = (album: AlbumSalesConfig) => {
        setEditingId(album.id);
        setEditForm({ ...album });
    };

    const handleSaveVenda = async (albumIdArg?: string, dataArg?: any) => {
        const targetId = albumIdArg || editingId;
        const targetData = dataArg || editForm;

        if (!targetId) return;
        try {
            const res = await fetch(`/api/admin/albuns/${targetId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(targetData),
            });
            if (res.ok) {
                if (!albumIdArg) setEditingId(null);
                setStatusMessage({ type: 'success', text: 'Alterações salvas!' });
                fetchAdminData();
            } else {
                setStatusMessage({ type: 'error', text: 'Erro ao salvar alterações.' });
            }
        } catch (error) {
            console.error(error);
            setStatusMessage({ type: 'error', text: 'Erro ao salvar.' });
        } finally {
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    const handleDeleteAlbum = async (id: string, titulo: string) => {
        if (!confirm(`Tem certeza que deseja excluir o álbum "${titulo}" e todas as suas fotos?`)) return;
        try {
            const res = await fetch(`/api/admin/albuns/${id}`, { method: 'DELETE' });
            if (res.ok) fetchAdminData();
            else alert('Erro ao excluir álbum');
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir álbum');
        }
    };

    const handleMoveAlbum = async (albumId: string, direction: 'up' | 'down', albumList: any[]) => {
        const index = albumList.findIndex(a => a.id === albumId);
        if (index === -1) return;
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === albumList.length - 1)) return;

        const newItems = [...albumList];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];

        const updatedItems = newItems.map((item, i) => ({ id: item.id, ordem: i }));

        try {
            const res = await fetch('/api/admin/albuns/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: updatedItems })
            });
            if (res.ok) fetchAdminData();
            else alert('Erro ao reorganizar álbuns');
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeletePhoto = async (photoId: string) => {
        if (!confirm('Excluir esta foto?')) return;
        try {
            const res = await fetch(`/api/admin/photos/${photoId}`, { method: 'DELETE' });
            if (res.ok) {
                setManagedImages(prev => prev.filter(img => img.id !== photoId));
                setAlbumPhotos(prev => prev.filter(img => img.id !== photoId));
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir');
        }
    }

    const handleSortPhotos = async (albumId: string, sortedImages: any[]) => {
        const orderMap = sortedImages.map((img, idx) => ({ id: img.id, ordem: idx }));
        try {
            await fetch('/api/admin/photos/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: orderMap })
            });
            setStatusMessage({ type: 'success', text: 'Ordem das fotos salva!' });
            setTimeout(() => setStatusMessage(null), 2000);
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Erro ao salvar ordem das fotos' });
        }
    };

    const refreshAlbumPhotos = useCallback(async (albumId: string, forceUpdateManaged: boolean = false) => {
        setIsPhotoLoading(true);
        try {
            const res = await fetch(`/api/admin/albuns/${albumId}/photos`);
            const data = await res.json();
            setAlbumPhotos(data);

            // Fix: Allow checking against explicit ID match OR force update which handles the race condition
            if (forceUpdateManaged || managedAlbum?.id === albumId) {
                setManagedImages(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsPhotoLoading(false);
        }
    }, [managedAlbum?.id]);

    const handleSetCover = async (albumId: string, imagePath: string, position?: string) => {
        // Agora aceita posição como string (ex: 'center' ou '50%')
        try {
            const res = await fetch('/api/album-cover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    albumId,
                    coverImagePath: imagePath,
                    type: coverType,
                    position: position || 'center'
                }),
            });
            if (res.ok) {
                const { album: updatedAlbum } = await res.json();
                setAlbuns(prev => prev.map(a => a.id === albumId ? { ...a, ...updatedAlbum } : a));
                if (selectedAlbumForCover?.id === albumId) setSelectedAlbumForCover({ ...selectedAlbumForCover, ...updatedAlbum });
                if (managedAlbum?.id === albumId) setManagedAlbum({ ...managedAlbum, ...updatedAlbum });
                setStatusMessage({ type: 'success', text: `Capa ${coverType} salva!` });
            }
        } catch (error) {
            console.error(error);
            setStatusMessage({ type: 'error', text: 'Erro ao salvar capa.' });
        } finally {
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    useEffect(() => {
        if (selectedAlbumForCover) {
            refreshAlbumPhotos(selectedAlbumForCover.id);
        }
    }, [selectedAlbumForCover, refreshAlbumPhotos]);

    useEffect(() => {
        const savedPassword = localStorage.getItem('admin_password');
        if (savedPassword) {
            setAuthPassword(savedPassword);
            validatePassword(savedPassword);
        } else {
            setIsCheckingAuth(false);
        }
    }, [validatePassword]);

    const handleReorderCategories = async (newCategories: any[]) => {
        setDbCategories(newCategories);
        try {
            await fetch('/api/admin/categories/reorder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categories: newCategories.map((c, i) => ({ id: c.id, ordem: i })) })
            });
            setStatusMessage({ type: 'success', text: 'Ordem das categorias salva!' });
        } catch (error) {
            console.error(error);
            setStatusMessage({ type: 'error', text: 'Erro ao salvar ordem.' });
        } finally {
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    const handleReorderTags = async (newTags: any[]) => {
        setDbTags(newTags);
        try {
            await fetch('/api/admin/tags/reorder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: newTags.map((t, i) => ({ name: t.name, ordem: i })) })
            });
            setStatusMessage({ type: 'success', text: 'Ordem das tags salva!' });
        } catch (error) {
            console.error(error);
            setStatusMessage({ type: 'error', text: 'Erro ao salvar ordem.' });
        } finally {
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    useEffect(() => {
        if (isAuthenticated) fetchAdminData();
    }, [activeTab, isAuthenticated, fetchAdminData]);

    const handleAddCategory = async (name: string) => {
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (res.ok) {
                setStatusMessage({ type: 'success', text: 'Categoria criada!' });
                fetchAdminData();
            } else {
                const data = await res.json();
                setStatusMessage({ type: 'error', text: data.error || 'Erro ao criar categoria' });
            }
        } catch (error) {
            console.error(error);
            setStatusMessage({ type: 'error', text: 'Erro ao criar categoria' });
        } finally {
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Excluir categoria? Isso pode afetar álbuns vinculados.')) return;
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setStatusMessage({ type: 'success', text: 'Categoria excluída!' });
                fetchAdminData();
            } else {
                setStatusMessage({ type: 'error', text: 'Erro ao excluir categoria' });
            }
        } catch (error) {
            console.error(error);
            setStatusMessage({ type: 'error', text: 'Erro ao excluir categoria' });
        } finally {
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    const handleAddTag = async (name: string) => {
        try {
            const res = await fetch('/api/admin/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            if (res.ok) {
                setStatusMessage({ type: 'success', text: 'Tag criada!' });
                fetchAdminData();
            } else {
                const data = await res.json();
                setStatusMessage({ type: 'error', text: data.error || 'Erro ao criar tag' });
            }
        } catch (error) {
            console.error(error);
            setStatusMessage({ type: 'error', text: 'Erro ao criar tag' });
        } finally {
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    const handleDeleteTag = async (id: string) => {
        if (!confirm('Excluir tag permanentemente?')) return;
        try {
            const res = await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setStatusMessage({ type: 'success', text: 'Tag excluída!' });
                fetchAdminData();
            } else {
                setStatusMessage({ type: 'error', text: 'Erro ao excluir tag' });
            }
        } catch (error) {
            console.error(error);
            setStatusMessage({ type: 'error', text: 'Erro ao excluir tag' });
        } finally {
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    return {
        isAuthenticated, setIsAuthenticated,
        authPassword, setAuthPassword,
        activeTab, setActiveTab,
        isLoading, setIsLoading,
        isCheckingAuth, setIsCheckingAuth,
        albumName, setAlbumName,
        description, setDescription,
        selectedCategoria, setSelectedCategoria,
        selectedTags, setSelectedTags,
        files, setFiles,
        isPrivateUpload, setIsPrivateUpload,
        accessPasswordUpload, setAccessPasswordUpload,
        basePriceUpload, setBasePriceUpload,
        baseLimitUpload, setBaseLimitUpload,
        extraPriceUpload, setExtraPriceUpload,
        statusMessage, setStatusMessage,
        dragActive, setDragActive,
        uploadProgress, setUploadProgress,
        albuns, setAlbuns,
        orders, setOrders,
        editingId, setEditingId,
        editForm, setEditForm,
        dbCategories, setDbCategories,
        dbTags, setDbTags,
        allCategoriesList, allTagsList, stats,
        selectedAlbumForCover, setSelectedAlbumForCover,
        coverType, setCoverType,
        albumPhotos, setAlbumPhotos,
        isPhotoLoading, setIsPhotoLoading,
        managedAlbum, setManagedAlbum,
        managedImages, setManagedImages,
        handleLogin, handleLogout, handleTagChange, handleUpload,
        startEdit, handleSaveVenda, handleDeleteAlbum,
        handleMoveAlbum, handleSetCover, handleDeletePhoto, handleSortPhotos,
        handleReorderCategories, handleReorderTags,
        fetchAdminData, refreshAlbumPhotos,
        handleAddCategory, handleDeleteCategory, handleAddTag, handleDeleteTag
    };
}
