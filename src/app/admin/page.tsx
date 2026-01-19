"use client";

import { Header } from '@/components/Header';
import categories from '@/config/categories';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiDollarSign,
  FiLock,
  FiMail,
  FiPlus,
  FiSettings,
  FiShoppingCart,
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

type TabType = 'upload' | 'vendas' | 'pedidos';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('upload');

  // Estados - Geral
  const [isLoading, setIsLoading] = useState(false);

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

    return Array.from(tagSet).map(tag => tag.charAt(0).toUpperCase() + tag.slice(1)).sort();
  }, [dbTags]);

  // Efeito - Carregar Dados quando mudar de aba
  useEffect(() => {
    if (isAuthenticated && (activeTab === 'vendas' || activeTab === 'pedidos')) {
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
      } else {
        alert(data.error || 'Senha incorreta');
      }
    } catch (error) {
      alert('Erro ao validar senha. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags(prevTags =>
      prevTags.includes(tag) ? prevTags.filter(t => t !== tag) : [...prevTags, tag]
    );
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0 || !albumName) {
      alert('Preencha os campos e selecione imagens.');
      return;
    }
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Enviando...' });

    const formData = new FormData();
    formData.append('albumName', albumName);
    formData.append('description', description);
    formData.append('categoria', selectedCategoria);
    formData.append('subcategoria', albumName);
    formData.append('isPrivate', String(isPrivateUpload));
    formData.append('accessPassword', accessPasswordUpload);
    formData.append('basePrice', String(basePriceUpload));
    formData.append('basePhotoLimit', String(baseLimitUpload));
    formData.append('extraPhotoPrice', String(extraPriceUpload));

    selectedTags.forEach(tag => formData.append('tags', tag));
    Array.from(files).forEach(file => formData.append('files', file));

    try {
      const res = await fetch('/api/album-upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Enviado com sucesso!' });
        setAlbumName('');
        setDescription('');
        setSelectedCategoria('');
        setSelectedTags([]);
        if (typeof document !== 'undefined') {
          (document.getElementById('file-input') as HTMLInputElement).value = '';
        }
      } else {
        setStatusMessage({ type: 'error', text: `Erro: ${result.error}` });
      }
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'Erro de conexão.' });
    } finally {
      setIsLoading(false);
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
    <main className="min-h-screen bg-[#050505] text-white">
      <Header />

      <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase">ADMIN DASHBOARD</h1>
            <p className="text-gray-500">Central de comando para álbuns, vendas e pedidos.</p>
          </div>

          {/* Custom Tabs */}
          <div className="bg-[#0a0a0a] border border-white/5 p-1.5 rounded-2xl flex gap-1">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'upload' ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-gray-500 hover:text-white'}`}
            >
              <FiPlus /> NOVO ÁLBUM
            </button>
            <button
              onClick={() => setActiveTab('vendas')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'vendas' ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-gray-500 hover:text-white'}`}
            >
              <FiDollarSign /> CONFIG. VENDAS
            </button>
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'pedidos' ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-gray-500 hover:text-white'}`}
            >
              <FiShoppingCart /> PEDIDOS
            </button>
          </div>
        </header>

        {/* Custom Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* ABA 1: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <FiUpload className="text-gray-500" />
                  Enviar Novo Álbum
                </h2>
                <form onSubmit={handleUpload} className="flex flex-col gap-6">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                    <label className="flex flex-col gap-2">
                      <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Visibilidade</span>
                      <select
                        value={isPrivateUpload ? 'privado' : 'publico'}
                        onChange={(e) => setIsPrivateUpload(e.target.value === 'privado')}
                        className="bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none"
                      >
                        <option value="publico">Portfólio Público (Grátis)</option>
                        <option value="privado">Venda Privada (Pago)</option>
                      </select>
                    </label>

                    {isPrivateUpload && (
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Senha de Acesso</span>
                        <input
                          type="text"
                          value={accessPasswordUpload}
                          onChange={(e) => setAccessPasswordUpload(e.target.value)}
                          placeholder="Senha p/ o cliente..."
                          className="bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-white/30" required
                        />
                      </label>
                    )}
                  </div>

                  {isPrivateUpload && (
                    <div className="grid grid-cols-3 gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Preço Base R$</span>
                        <input
                          type="number"
                          value={basePriceUpload}
                          onChange={(e) => setBasePriceUpload(parseFloat(e.target.value))}
                          className="bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none" required
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Limite Fotos</span>
                        <input
                          type="number"
                          value={baseLimitUpload}
                          onChange={(e) => setBaseLimitUpload(parseInt(e.target.value))}
                          className="bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none" required
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Extra R$</span>
                        <input
                          type="number"
                          value={extraPriceUpload}
                          onChange={(e) => setExtraPriceUpload(parseFloat(e.target.value))}
                          className="bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none" required
                        />
                      </label>
                    </div>
                  )}

                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Descrição Curta</span>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-white/30 transition-all text-sm min-h-[100px]" required
                    />
                  </label>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Selecione ou crie Tags</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="new-tag-input"
                          placeholder="Criar tag..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val) {
                                handleTagChange(val);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] outline-none focus:border-white/30"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl">
                      {allTagsList.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagChange(tag)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${selectedTags.includes(tag) ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500 hover:border-white/30'}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Imagens</span>
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      onChange={(e) => setFiles(e.target.files)}
                      className="file:bg-white/10 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-xl file:mr-4 file:text-xs file:font-bold file:cursor-pointer hover:file:bg-white/20 bg-white/5 border border-white/10 rounded-2xl p-3 text-xs"
                      accept="image/*" required
                    />
                  </label>

                  <button type="submit" disabled={isLoading} className="bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 transition-all uppercase mt-4 disabled:opacity-50">
                    {isLoading ? 'Enviando...' : 'Criar Álbum'}
                  </button>

                  {statusMessage.text && (
                    <div className={`p-4 rounded-2xl text-xs font-bold text-center border ${statusMessage.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                      {statusMessage.text}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* ABA 2: CONFIG VENDAS */}
          {activeTab === 'vendas' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <FiDollarSign className="text-gray-500" />
                  Configurar Vendas
                </h2>
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {albuns.map((album) => (
                  <div
                    key={album.id}
                    className={`bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 transition-all ${editingId === album.id ? 'ring-1 ring-white/20 bg-[#0f0f0f]' : 'hover:border-white/10'}`}
                  >
                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-lg font-bold">{album.titulo}</h3>
                          {album.isForSale ? <span className="px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[8px] font-black uppercase">Venda Ativa</span> : <span className="px-2 py-0.5 bg-gray-500/10 text-gray-500 border border-white/5 rounded-full text-[8px] font-black uppercase">Exposição</span>}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                            <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Preço Base</p>
                            <p className="font-mono text-sm leading-none tracking-tight">R$ {(album.basePrice ?? 0).toFixed(2)}</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                            <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Fotos Base</p>
                            <p className="font-mono text-sm leading-none tracking-tight">{album.basePhotoLimit} fts</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                            <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Custo Extra</p>
                            <p className="font-mono text-sm leading-none tracking-tight">R$ {(album.extraPhotoPrice ?? 0).toFixed(2)}</p>
                          </div>
                          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                            <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Privacidade</p>
                            <p className="text-xs leading-none flex items-center gap-1">
                              {album.isPrivate ? <><FiLock className="text-yellow-600" /> Privado</> : 'Público'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="lg:w-1/3 flex flex-col justify-center">
                        {editingId === album.id ? (
                          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <label className="flex flex-col gap-1 text-[8px] text-gray-500 uppercase font-bold">Venda Ativa
                                <select value={editForm.isForSale ? 't' : 'f'} onChange={e => setEditForm({ ...editForm, isForSale: e.target.value === 't' })} className="bg-black border border-white/10 rounded-lg p-1.5 text-xs text-white">
                                  <option value="t">Ativar</option><option value="f">Desativar</option>
                                </select>
                              </label>
                              <label className="flex flex-col gap-1 text-[8px] text-gray-500 uppercase font-bold">Modelo
                                <select value={editForm.isPrivate ? 't' : 'f'} onChange={e => setEditForm({ ...editForm, isPrivate: e.target.value === 't' })} className="bg-black border border-white/10 rounded-lg p-1.5 text-xs text-white">
                                  <option value="t">Privado</option><option value="f">Público</option>
                                </select>
                              </label>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <label className="text-[8px] text-gray-500 uppercase font-bold">Base R$
                                <input type="number" value={editForm.basePrice} onChange={e => setEditForm({ ...editForm, basePrice: parseFloat(e.target.value) })} className="w-full bg-black border border-white/10 rounded-lg p-1.5 text-xs" />
                              </label>
                              <label className="text-[8px] text-gray-500 uppercase font-bold">Limite
                                <input type="number" value={editForm.basePhotoLimit} onChange={e => setEditForm({ ...editForm, basePhotoLimit: parseInt(e.target.value) })} className="w-full bg-black border border-white/10 rounded-lg p-1.5 text-xs" />
                              </label>
                              <label className="text-[8px] text-gray-500 uppercase font-bold">Extra R$
                                <input type="number" value={editForm.extraPhotoPrice} onChange={e => setEditForm({ ...editForm, extraPhotoPrice: parseFloat(e.target.value) })} className="w-full bg-black border border-white/10 rounded-lg p-1.5 text-xs" />
                              </label>
                            </div>
                            {editForm.isPrivate && (
                              <label className="text-[8px] text-gray-500 uppercase font-bold">Senha de Acesso
                                <input type="text" value={editForm.accessPassword} onChange={e => setEditForm({ ...editForm, accessPassword: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg p-1.5 text-xs" />
                              </label>
                            )}
                            <div className="flex gap-2">
                              <button onClick={handleSaveVenda} className="flex-1 bg-white text-black font-bold py-2 rounded-lg text-[10px] uppercase">Salvar</button>
                              <button onClick={() => setEditingId(null)} className="px-3 bg-white/10 rounded-lg"><FiX /></button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 w-full">
                            <Link href={`/admin/albuns/${album.id}`} className="w-full bg-white text-black rounded-2xl p-4 flex items-center justify-between hover:bg-gray-200 transition-all group">
                              <span className="text-sm font-bold">Gerenciar Álbum</span>
                              <FiSettings className="text-black group-hover:rotate-45 transition-all" />
                            </Link>
                            <button onClick={() => startEdit(album)} className="w-full border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:border-white/30 transition-all text-gray-400 hover:text-white">
                              <span className="text-xs font-bold">Edição Rápida (Vendas)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
                        <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-gray-500">Origem</th>
                        <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-gray-500 text-center">Fotos</th>
                        <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-gray-500 text-center">Valor Total</th>
                        <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-gray-500 text-center">Status</th>
                        <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-gray-500">Realizado em</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-5">
                            <p className="font-bold flex items-center gap-2"><FiUser className="text-gray-600" size={12} /> {order.customerName}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-2"><FiMail className="text-gray-600" size={12} /> {order.customerEmail}</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-gray-400 font-medium">{order.Album?.titulo || 'Removido'}</span>
                          </td>
                          <td className="px-6 py-5 text-center font-mono text-xs">{order.totalPhotos}</td>
                          <td className="px-6 py-5 text-center font-black">R$ {order.totalPrice.toFixed(2)}</td>
                          <td className="px-6 py-5 text-center uppercase">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black border ${order.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                              {order.status === 'paid' ? 'Liquidado' : 'Aguardando'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-xs text-gray-500 font-mono">
                            {new Date(order.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
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
      </div>
    </main>
  );
}