"use client";

import categories from '@/config/categories';
import { getThumbUrl } from '@/lib/cloudinaryOptimize';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiDollarSign,
  FiGrid,
  FiImage,
  FiLock,
  FiPlus,
  FiSettings,
  FiShoppingCart,
  FiTag,
  FiTrash2,
  FiUpload,
  FiUser,
  FiX
} from 'react-icons/fi';

// Config - No longer using client-side password validation for security and production reliability

interface AlbumSalesConfig {
  id: string;
  titulo: string;
  isForSale: boolean;
  isPrivate: boolean;
  accessPassword?: string;
  basePrice: number;
  basePhotoLimit: number;
  extraPhotoPrice: number;
  coverImageDesktop?: string;
  coverImageMobile?: string;
  coverImageDesktopPosition?: string;
  coverImageMobilePosition?: string;
  _count?: { Image: number };
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  totalPhotos: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  Album?: { titulo: string };
}

type TabType = 'overview' | 'albuns' | 'taxonomia' | 'pedidos';

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all border-r-2 ${active
      ? 'bg-white/5 text-white border-white'
      : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/[0.02]'
      }`}
  >
    <Icon size={18} />
    <span className="uppercase tracking-tighter">{label}</span>
  </button>
);

export default function AdminDashboard() {
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
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Estados - Vendas & Pedidos
  const [albuns, setAlbuns] = useState<AlbumSalesConfig[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AlbumSalesConfig>>({});

  // Estados - Categorias & Tags do Banco
  const [dbCategories, setDbCategories] = useState<{ id: string, name: string }[]>([]);
  const [dbTags, setDbTags] = useState<string[]>([]);

  // Derivados - Categorias (Mistura estático + banco)
  const allCategoriesList = useMemo(() => {
    const staticCats = Object.keys(categories);
    const dbCatNames = dbCategories.map(c => c.name);
    return Array.from(new Set([...staticCats, ...dbCatNames])).sort();
  }, [dbCategories]);

  const allTagsList = useMemo(() => {
    const tagSet = new Set<string>();
    // Tags estáticas
    Object.values(categories).forEach((subCatObject: any) => {
      Object.values(subCatObject).forEach((tagString: any) => {
        tagString.split(',').forEach((tag: string) => tag.trim() && tagSet.add(tag.trim()));
      });
    });
    // Tags do banco
    dbTags.forEach(tag => tagSet.add(tag));
    // Tags selecionadas (inclusive as novas digitadas pelo usuário)
    selectedTags.forEach(tag => tagSet.add(tag));

    return Array.from(tagSet)
      .filter(tag => tag.trim() !== '')
      .map(tag => tag.trim().charAt(0).toUpperCase() + tag.trim().slice(1))
      .sort();
  }, [dbTags, selectedTags]);

  const stats = useMemo(() => {
    return {
      totalAlbuns: albuns.length,
      totalPhotos: albuns.reduce((acc, alb) => acc + (alb._count?.Image || 0), 0),
      totalOrders: orders.length,
      totalRevenue: orders.reduce((acc, ord) => acc + ord.totalPrice, 0)
    };
  }, [albuns, orders]);

  // Estados - Capas
  const [selectedAlbumForCover, setSelectedAlbumForCover] = useState<AlbumSalesConfig | any | null>(null);
  const [coverType, setCoverType] = useState<'desktop' | 'mobile'>('desktop');

  // Efeito - Carregar Fotos do Álbum Selecionado para Capa
  const [albumPhotos, setAlbumPhotos] = useState<any[]>([]);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  useEffect(() => {
    if (selectedAlbumForCover) {
      setAlbumPhotos([]);
      setIsPhotoLoading(true);
      fetch(`/api/admin/albuns/${selectedAlbumForCover.id}`)
        .then(res => {
          if (!res.ok) throw new Error(`Falha: ${res.status}`);
          return res.json();
        })
        .then(data => {
          // Prisma retorna 'Image', mas vamos ser resilientes
          const photos = data.Image || data.images || data.imagens || [];
          setAlbumPhotos(photos);
        })
        .catch(err => {
          console.error('Erro ao carregar fotos:', err);
          setStatusMessage({ text: 'Erro ao carregar fotos do álbum', type: 'error' });
        })
        .finally(() => setIsPhotoLoading(false));
    }
  }, [selectedAlbumForCover]);

  // Efeito - Persistência de Autenticação
  useEffect(() => {
    const savedPassword = localStorage.getItem('admin_password');
    if (savedPassword) {
      setAuthPassword(savedPassword);
      validatePassword(savedPassword);
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  async function validatePassword(password: string) {
    // Não usamos o isLoading global aqui para não travar a UI se for auto-login
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
  }

  // Efeito - Carregar Dados quando mudar de aba
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [activeTab, isAuthenticated]);

  async function fetchAdminData() {
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

      setAlbuns(albunsData);
      setOrders(ordersData);
      setDbCategories(catsData);
      setDbTags(tagsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }

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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0 || !albumName) {
      alert('Preencha os campos e selecione imagens.');
      return;
    }
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Criando álbum...' });

    try {
      // 1. Criar Álbum (Metadados)
      const albumData = new FormData();
      albumData.append('albumName', albumName);
      albumData.append('description', description);
      albumData.append('categoria', selectedCategoria);
      albumData.append('subcategoria', albumName); // Legacy support
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

      if (!createRes.ok) {
        throw new Error(createResult.error || 'Erro ao criar álbum');
      }

      const albumId = createResult.albumId;

      // 2. Upload das Imagens (Sequencial para evitar 413)
      const fileArray = Array.from(files);
      let successCount = 0;
      setUploadProgress(0);

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const progress = Math.round(((i) / fileArray.length) * 100);
        setUploadProgress(progress);
        setStatusMessage({ type: 'info', text: `Enviando ${i + 1} de ${fileArray.length}...` });

        const uploadData = new FormData();
        uploadData.append('albumId', albumId);
        uploadData.append('file', file);
        uploadData.append('order', String(i));

        const uploadRes = await fetch('/api/admin/albuns/upload', {
          method: 'POST',
          body: uploadData,
        });

        if (!uploadRes.ok) {
          let errorDetail = 'Erro desconhecido';

          if (uploadRes.status === 413) {
            errorDetail = 'Arquivo muito grande. O limite é de aproximadamente 4.5MB por imagem.';
          } else {
            const contentType = uploadRes.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorData = await uploadRes.json();
              errorDetail = errorData.error || errorData.details || errorDetail;
            } else {
              errorDetail = `Erro no servidor (Status ${uploadRes.status})`;
            }
          }

          console.error(`Falha no upload da imagem ${i + 1}:`, errorDetail);
          throw new Error(`Imagem ${i + 1}: ${errorDetail}`);
        } else {
          successCount++;
        }
      }

      setUploadProgress(100);
      setStatusMessage({ type: 'success', text: `Álbum criado com sucesso! ${successCount} imagens enviadas.` });

      // Limpar form
      setAlbumName('');
      setDescription('');
      setSelectedCategoria('');
      setSelectedTags([]);
      setFiles(null);
      if (typeof document !== 'undefined') {
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }

    } catch (error: any) {
      console.error(error);
      setStatusMessage({ type: 'error', text: `Erro: ${error.message || 'Erro desconhecido'}` });
    } finally {
      setIsLoading(false);
      // Mantemos o progresso em 100 ou 0 dependendo do sucesso por um tempo? 
      // O finally vai resetar o isLoading o que vai sumir com o progress bar na UI se eu usar condicional
    }
  };

  const startEdit = (album: AlbumSalesConfig) => {
    setEditingId(album.id);
    setEditForm({
      ...album,
      basePrice: album.basePrice ?? 200,
      basePhotoLimit: album.basePhotoLimit ?? 10,
      extraPhotoPrice: album.extraPhotoPrice ?? 50,
      isForSale: album.isForSale ?? false,
      isPrivate: album.isPrivate ?? false,
      accessPassword: album.accessPassword ?? ''
    });
  };

  const handleSaveVenda = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/admin/albuns/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingId(null);
        fetchAdminData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAlbum = async (id: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir o álbum "${titulo}" e todas as suas fotos?`)) return;
    try {
      const res = await fetch(`/api/admin/albuns/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert('Erro ao excluir álbum');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir álbum');
    }
  };

  const handleSetCover = async (albumId: string, imagePath: string, position?: string) => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Salvando capa...' });

    try {
      const res = await fetch('/api/album-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          albumId,
          coverImagePath: imagePath,
          type: coverType,
          position: position || (coverType === 'desktop' ? selectedAlbumForCover?.coverImageDesktopPosition : selectedAlbumForCover?.coverImageMobilePosition) || 'center'
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedAlbum = data.album;

        setAlbuns(prev => prev.map(a =>
          a.id === albumId ? {
            ...a,
            coverImage: updatedAlbum.coverImage,
            coverImageMobile: updatedAlbum.coverImageMobile,
            coverImageDesktop: updatedAlbum.coverImageDesktop,
            coverImageMobilePosition: updatedAlbum.coverImageMobilePosition,
            coverImageDesktopPosition: updatedAlbum.coverImageDesktopPosition
          } : a
        ));

        if (selectedAlbumForCover?.id === albumId) {
          setSelectedAlbumForCover({
            ...selectedAlbumForCover,
            coverImage: updatedAlbum.coverImage,
            coverImageMobile: updatedAlbum.coverImageMobile,
            coverImageDesktop: updatedAlbum.coverImageDesktop,
            coverImageMobilePosition: updatedAlbum.coverImageMobilePosition,
            coverImageDesktopPosition: updatedAlbum.coverImageDesktopPosition
          });
        }

        setStatusMessage({ type: 'success', text: 'Capa atualizada!' });
      } else {
        throw new Error('Falha ao atualizar capa');
      }
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: 'Erro ao salvar capa.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="font-mono min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white">
        <FiActivity size={40} className="text-blue-500 animate-pulse mb-4" />
        <h1 className="text-xl font-black tracking-tighter uppercase animate-pulse">Validando Acesso...</h1>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="font-mono min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white">
        <h1 className="text-3xl font-black mb-8 tracking-tighter uppercase">Admin Central</h1>
        <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <label className="flex flex-col gap-2">
              <span className="text-xs text-gray-500 uppercase font-bold ml-1">Senha de Acesso</span>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-white/30 transition-all"
                placeholder="Digite a senha..."
              />
            </label>
            <button type="submit" className="bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 transition-all uppercase">Entrar no Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white flex flex-col pt-12">

      <div className="flex flex-1 md:pl-44">
        {/* SIDEBAR - Agora adaptada para conviver com o Header da discografia */}
        <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col hidden lg:flex sticky top-0 h-screen">
          <div className="p-8 mt-12">
            <h2 className="text-xs font-black text-gray-600 uppercase tracking-widest mb-4">Admin Central</h2>
          </div>
          <nav className="flex-1">
            <SidebarItem icon={FiActivity} label="Visão Geral" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <SidebarItem icon={FiGrid} label="Gestão de Álbuns" active={activeTab === 'albuns'} onClick={() => setActiveTab('albuns')} />
            <SidebarItem icon={FiTag} label="Categorias e Tags" active={activeTab === 'taxonomia'} onClick={() => setActiveTab('taxonomia')} />
            <SidebarItem icon={FiShoppingCart} label="Pedidos" active={activeTab === 'pedidos'} onClick={() => setActiveTab('pedidos')} />
          </nav>

          <div className="p-6 border-t border-white/5 space-y-4">
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Status do Sistema</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold">Operacional</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <FiLock size={14} />
              Sair do Sistema
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 overflow-y-auto p-8 lg:p-12">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{activeTab}</p>
              <h1 className="text-4xl font-black tracking-tighter uppercase">
                {activeTab === 'overview' && 'Visão Geral'}
                {activeTab === 'albuns' && 'Gestão de Álbuns'}
                {activeTab === 'taxonomia' && 'Categorias & Tags'}
                {activeTab === 'pedidos' && 'Monitoramento de Pedidos'}
              </h1>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="flex lg:hidden overflow-x-auto pb-2 gap-2 -mx-2 px-2 scrollbar-hide">
              {[
                { id: 'overview', icon: FiActivity },
                { id: 'albuns', icon: FiGrid },
                { id: 'taxonomia', icon: FiTag },
                { id: 'pedidos', icon: FiShoppingCart }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`p-3 rounded-xl flex-shrink-0 transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}
                >
                  <tab.icon size={20} />
                </button>
              ))}
            </div>

            {activeTab === 'albuns' && (
              <button
                onClick={() => { /* Scroll to form */ document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="bg-white text-black text-xs font-black px-6 py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 self-start md:self-auto"
              >
                <FiPlus size={16} /> NOVO ÁLBUM
              </button>
            )}
          </header>

          {/* Custom Tab Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ABA 0: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total de Álbuns', value: stats.totalAlbuns, icon: FiGrid, color: 'text-blue-500' },
                    { label: 'Total de Fotos', value: stats.totalPhotos, icon: FiImage, color: 'text-purple-500' },
                    { label: 'Pedidos Realizados', value: stats.totalOrders, icon: FiShoppingCart, color: 'text-green-500' },
                    { label: 'Faturamento Total', value: `R$ ${stats.totalRevenue.toFixed(2)}`, icon: FiDollarSign, color: 'text-yellow-500' },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl hover:border-white/10 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-2xl bg-white/5 ${item.color} group-hover:scale-110 transition-all`}>
                          <item.icon size={24} />
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{item.label}</p>
                        <h3 className="text-2xl font-black font-mono">{item.value}</h3>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <FiActivity className="text-gray-500" /> Atividade Recente
                    </h3>
                    <div className="space-y-4">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                              <FiUser size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{order.customerName}</p>
                              <p className="text-[10px] text-gray-500 uppercase font-black">{order.Album?.titulo}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-green-500">R$ {order.totalPrice.toFixed(2)}</p>
                            <p className="text-[10px] text-gray-500 font-mono italic">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && <p className="text-center py-8 text-gray-600 text-sm">Nenhuma atividade recente.</p>}
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <FiPlus className="text-gray-500" /> Ações Rápidas
                    </h3>
                    <div className="flex flex-col gap-3">
                      <button onClick={() => setActiveTab('albuns')} className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left transition-all flex items-center justify-between group">
                        <span className="text-xs font-bold uppercase">Novo Álbum</span>
                        <FiUpload size={14} className="group-hover:translate-x-1 transition-all" />
                      </button>
                      <button onClick={() => setActiveTab('taxonomia')} className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left transition-all flex items-center justify-between group">
                        <span className="text-xs font-bold uppercase">Gerenciar Tags</span>
                        <FiTag size={14} className="group-hover:translate-x-1 transition-all" />
                      </button>
                      <button onClick={() => setActiveTab('pedidos')} className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left transition-all flex items-center justify-between group">
                        <span className="text-xs font-bold uppercase">Ver Pedidos</span>
                        <FiShoppingCart size={14} className="group-hover:translate-x-1 transition-all" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABA 1: ALBUNS (Gestão, Vendas, Capas, Upload) */}
            {activeTab === 'albuns' && (
              <div className="space-y-12">
                {/* Seção de Upload - Agora integrada */}
                <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <FiPlus className="text-gray-500" /> Criar Novo Álbum
                  </h3>
                  {/* ... Upload Form (Same logic as before but updated classes) ... */}
                  <form onSubmit={handleUpload} className="flex flex-col gap-6">
                    {/* ... (reusing upload form fields from previous version) ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Categoria</span>
                        <input
                          list="categories-list"
                          value={selectedCategoria}
                          onChange={(e) => setSelectedCategoria(e.target.value)}
                          placeholder="Selecione ou digite nova..."
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-white/30 transition-all text-sm" required
                        />
                        <datalist id="categories-list">
                          {allCategoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </datalist>
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Nome do Álbum</span>
                        <input
                          type="text"
                          value={albumName}
                          onChange={(e) => setAlbumName(e.target.value)}
                          placeholder="Nome da coleção..."
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-white/30 transition-all text-sm" required
                        />
                      </label>
                    </div>

                    {/* ... Visibilidade e Preços ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Privacidade</span>
                        <select
                          value={isPrivateUpload ? 'privado' : 'publico'}
                          onChange={(e) => setIsPrivateUpload(e.target.value === 'privado')}
                          className="bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none"
                        >
                          <option value="publico">Apenas Portfólio (Público)</option>
                          <option value="privado">Venda Direta (Privado c/ Senha)</option>
                        </select>
                      </label>
                      {isPrivateUpload && (
                        <label className="flex flex-col gap-2">
                          <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Senha de Acesso</span>
                          <input
                            type="text"
                            value={accessPasswordUpload}
                            onChange={(e) => setAccessPasswordUpload(e.target.value)}
                            className="bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-white/30" required
                          />
                        </label>
                      )}
                    </div>

                    {isPrivateUpload && (
                      <div className="grid grid-cols-3 gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                        <label className="flex flex-col gap-2">
                          <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Base R$</span>
                          <input type="number" value={basePriceUpload} onChange={(e) => setBasePriceUpload(parseFloat(e.target.value))} className="bg-black border border-white/10 rounded-xl p-3 text-sm text-white" />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Qtd Base</span>
                          <input type="number" value={baseLimitUpload} onChange={(e) => setBaseLimitUpload(parseInt(e.target.value))} className="bg-black border border-white/10 rounded-xl p-3 text-sm text-white" />
                        </label>
                        <label className="flex flex-col gap-2">
                          <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Extra R$</span>
                          <input type="number" value={extraPriceUpload} onChange={(e) => setExtraPriceUpload(parseFloat(e.target.value))} className="bg-black border border-white/10 rounded-xl p-3 text-sm text-white" />
                        </label>
                      </div>
                    )}

                    <label className="flex flex-col gap-2">
                      <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Descrição</span>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none min-h-[100px] text-sm" />
                    </label>

                    {/* Dropzone Reuso */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Imagens</span>
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragActive(false);
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) setFiles(e.dataTransfer.files);
                        }}
                        onClick={() => document.getElementById('file-input-new')?.click()}
                        className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center gap-4 ${dragActive ? 'border-white bg-white/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                      >
                        <input id="file-input-new" type="file" multiple onChange={(e) => setFiles(e.target.files)} className="hidden" accept="image/*" />
                        <FiUpload size={24} className="text-gray-500 group-hover:text-white group-hover:scale-110 transition-all" />
                        <p className="text-sm font-bold">{files ? `${files.length} arquivos` : 'Arraste ou clique para enviar'}</p>
                      </div>
                    </div>

                    <button type="submit" disabled={isLoading || !files} className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-gray-200 transition-all uppercase disabled:opacity-30">
                      {isLoading ? 'Enviando...' : `Criar Álbum ${files ? `(${files.length} fotos)` : ''}`}
                    </button>
                  </form>
                </div>

                {/* Lista de Álbuns - Agora com edição integrada e seletor de capa */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <FiGrid className="text-gray-500" /> Álbuns Existentes
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {albuns.map((album) => (
                      <div key={album.id} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all">
                        <div className="flex flex-col lg:flex-row justify-between gap-8">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <h4 className="text-lg font-bold">{album.titulo}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${album.isForSale ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                  {album.isForSale ? 'Venda Ativa' : 'Exposição'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Integração do Seletor de Capas */}
                                <button
                                  onClick={() => setSelectedAlbumForCover(album)}
                                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all text-xs font-bold flex items-center gap-2"
                                >
                                  <FiImage size={14} /> CAPAS
                                </button>
                                <Link href={`/admin/albuns/${album.id}`} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                                  <FiSettings size={14} />
                                </Link>
                                <button onClick={() => handleDeleteAlbum(album.id, album.titulo)} className="p-2 hover:text-red-500 transition-colors">
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Preço Base</p>
                                <p className="font-mono text-sm leading-none tracking-tight">R$ {(album.basePrice ?? 0).toFixed(2)}</p>
                              </div>
                              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Limite fts</p>
                                <p className="font-mono text-sm leading-none tracking-tight">{album.basePhotoLimit}</p>
                              </div>
                              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Fotos Total</p>
                                <p className="font-mono text-sm leading-none tracking-tight">{album._count?.Image || 0}</p>
                              </div>
                              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Modelo</p>
                                <p className="text-[10px] leading-none flex items-center gap-1">
                                  {album.isPrivate ? <><FiLock className="text-yellow-600" /> Privado</> : 'Público'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MODAL / SEÇÃO DE CAPAS (Se selecionado) */}
                {selectedAlbumForCover && (
                  <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-6xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                      <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                                  const currentPos = coverType === 'desktop' ? selectedAlbumForCover?.coverImageDesktopPosition : selectedAlbumForCover?.coverImageMobilePosition;
                                  const active = (currentPos || 'center') === pos;
                                  const label = pos === 'top' ? 'Topo' : pos === 'center' ? 'Centro' : 'Base';

                                  return (
                                    <button
                                      key={pos}
                                      onClick={() => {
                                        const currentPath = coverType === 'desktop' ? selectedAlbumForCover?.coverImageDesktop : selectedAlbumForCover?.coverImageMobile;
                                        if (currentPath) handleSetCover(selectedAlbumForCover.id, currentPath, pos);
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
                        <button onClick={() => setSelectedAlbumForCover(null)} className="p-2 hover:bg-white/5 rounded-full transition-all self-start md:self-auto"><FiX size={24} /></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-8">
                        <p className="text-xs text-gray-500 mb-6 uppercase tracking-widest font-bold">Selecione uma imagem para ser a capa {coverType}</p>

                        {isPhotoLoading ? (
                          <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <FiActivity size={40} className="text-blue-500 animate-pulse" />
                            <p className="text-sm font-bold animate-pulse">Carregando fotos do álbum...</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {albumPhotos.map((photo) => {
                              const isCurrentCover = coverType === 'desktop'
                                ? selectedAlbumForCover?.coverImageDesktop === photo.path
                                : selectedAlbumForCover?.coverImageMobile === photo.path;

                              const currentPos = coverType === 'desktop' ? selectedAlbumForCover?.coverImageDesktopPosition : selectedAlbumForCover?.coverImageMobilePosition;

                              return (
                                <div
                                  key={photo.id}
                                  onClick={() => handleSetCover(selectedAlbumForCover!.id, photo.path)}
                                  className={`relative aspect-square cursor-pointer rounded-xl overflow-hidden group border-2 transition-all ${isCurrentCover ? 'border-white' : 'border-transparent hover:border-white/30'}`}
                                >
                                  <img
                                    src={getThumbUrl(photo.path, true)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    style={{ objectPosition: isCurrentCover ? currentPos || 'center' : 'center' }}
                                    loading="lazy"
                                  />
                                  {isCurrentCover && (
                                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                      <div className="bg-white text-black text-[8px] font-black px-2 py-1 rounded shadow-xl flex flex-col items-center gap-1">
                                        <span>ATUAL</span>
                                        <span className="text-[6px] opacity-50 uppercase">{currentPos || 'center'}</span>
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                    <span className="text-[10px] font-black uppercase">{isCurrentCover ? 'Trocar Alinhamento' : 'Definir'}</span>
                                  </div>
                                </div>
                              );
                            })}
                            {albumPhotos.length === 0 && <p className="col-span-full py-20 text-center text-gray-600 italic">Nenhuma foto encontrada neste álbum.</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ABA 2: TAXONOMIA (Categorias e Tags) */}
            {activeTab === 'taxonomia' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <FiTag className="text-gray-500" /> Gestão de Tags
                  </h3>
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="tax-tag-input"
                        placeholder="Adicionar nova tag..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/30"
                      />
                      <button className="bg-white text-black px-6 py-2 rounded-xl font-bold text-xs uppercase">Add</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allTagsList.map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white hover:border-white/30 cursor-default transition-all">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <FiGrid className="text-gray-500" /> Categorias do Sistema
                  </h3>
                  <div className="space-y-3">
                    {allCategoriesList.map(cat => (
                      <div key={cat} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group">
                        <span className="text-sm font-bold uppercase tracking-tight">{cat}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-all">
                          <button className="text-gray-600 hover:text-red-500"><FiTrash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 3: PEDIDOS */}
            {activeTab === 'pedidos' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <FiShoppingCart className="text-gray-500" />
                    Monitoramento de Compras
                  </h2>
                  <FiActivity className="text-blue-500 animate-pulse" />
                </div>
                <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                          <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-gray-500">Comprador</th>
                          <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-gray-500">Álbum</th>
                          <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-gray-500 text-center">Valor</th>
                          <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-gray-500 text-center">Status</th>
                          <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-gray-500">Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-5">
                              <p className="font-bold">{order.customerName}</p>
                              <p className="text-xs text-gray-500">{order.customerEmail}</p>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-gray-400 font-medium">{order.Album?.titulo || 'Removido'}</span>
                            </td>
                            <td className="px-6 py-5 text-center font-black">R$ {order.totalPrice.toFixed(2)}</td>
                            <td className="px-6 py-5 text-center uppercase">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black border ${order.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                {order.status === 'paid' ? 'Liquidado' : 'Pendente'}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-xs text-gray-500 font-mono">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && !isLoading && (
                          <tr>
                            <td colSpan={6} className="px-6 py-20 text-center">
                              <div className="flex flex-col items-center gap-3 text-gray-600">
                                <FiShoppingCart size={40} className="opacity-20" />
                                <span className="text-sm font-bold uppercase tracking-widest">Nenhum pedido registrado</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}