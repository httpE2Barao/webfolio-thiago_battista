import { FiPlus, FiUpload, FiGrid, FiArrowUp, FiArrowDown, FiSettings, FiImage, FiTrash2, FiLock } from 'react-icons/fi';
import { AlbumSalesConfig } from '../_hooks/useAdminData';
import { Toggle } from './Toggle';

interface TabAlbunsProps {
    albumName: string;
    setAlbumName: (v: string) => void;
    description: string;
    setDescription: (v: string) => void;
    selectedCategoria: string;
    setSelectedCategoria: (v: string) => void;
    allCategoriesList: string[];
    isPrivateUpload: boolean;
    setIsPrivateUpload: (v: boolean) => void;
    accessPasswordUpload: string;
    setAccessPasswordUpload: (v: string) => void;
    basePriceUpload: number;
    setBasePriceUpload: (v: number) => void;
    baseLimitUpload: number;
    setBaseLimitUpload: (v: number) => void;
    extraPriceUpload: number;
    setExtraPriceUpload: (v: number) => void;
    files: FileList | null;
    setFiles: (v: FileList | null) => void;
    dragActive: boolean;
    setDragActive: (v: boolean) => void;
    isLoading: boolean;
    handleUpload: (e: React.FormEvent) => void;
    albuns: AlbumSalesConfig[];
    handleMoveAlbum: (id: string, dir: 'up' | 'down', list: any[]) => void;
    handleDeleteAlbum: (id: string, title: string) => void;
    setSelectedAlbumForCover: (album: any) => void;
    setActiveTab: (tab: any) => void;
    setManagedAlbum: (album: any) => void;
    refreshAlbumPhotos: (albumId: string) => void;
}

export const TabAlbuns = ({
    albumName, setAlbumName,
    description, setDescription,
    selectedCategoria, setSelectedCategoria,
    allCategoriesList,
    isPrivateUpload, setIsPrivateUpload,
    accessPasswordUpload, setAccessPasswordUpload,
    basePriceUpload, setBasePriceUpload,
    baseLimitUpload, setBaseLimitUpload,
    extraPriceUpload, setExtraPriceUpload,
    files, setFiles,
    dragActive, setDragActive,
    isLoading,
    handleUpload,
    albuns,
    handleMoveAlbum,
    handleDeleteAlbum,
    setSelectedAlbumForCover,
    setActiveTab, setManagedAlbum, refreshAlbumPhotos
}: TabAlbunsProps) => {
    return (
        <div className="space-y-12">
            {/* Seção de Upload */}
            <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <FiPlus className="text-gray-500" /> Criar Novo Álbum
                </h3>
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

                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-6">
                        <div className="max-w-xs">
                            <Toggle
                                label="Acesso Restrito"
                                subLabel={isPrivateUpload ? "Privado (Venda Direta)" : "Apenas Portfólio (Público)"}
                                checked={isPrivateUpload}
                                onChange={setIsPrivateUpload}
                                color="purple"
                            />
                        </div>

                        {isPrivateUpload && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                                <label className="flex flex-col gap-2">
                                    <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Senha de Acesso</span>
                                    <input
                                        type="text"
                                        value={accessPasswordUpload}
                                        onChange={(e) => setAccessPasswordUpload(e.target.value)}
                                        className="bg-black border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-white/30" required
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    {isPrivateUpload && (
                        <div className="grid grid-cols-3 gap-4 bg-white/5 p-6 rounded-3xl border border-white/5 animate-in slide-in-from-top-2 duration-300">
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

            {/* Lista de Álbuns */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-3">
                    <FiGrid className="text-gray-500" /> Álbuns por Categoria
                </h3>

                {Object.entries(
                    albuns.reduce((acc, album) => {
                        const cat = album.categoria || 'Sem Categoria';
                        if (!acc[cat]) acc[cat] = [];
                        acc[cat].push(album);
                        return acc;
                    }, {} as Record<string, any[]>)
                ).map(([categoria, categoryAlbuns]) => {
                    const sortedAlbuns = [...categoryAlbuns].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

                    return (
                        <div key={categoria} className="space-y-6 pt-8 first:pt-0">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-white/10" />
                                {categoria}
                                <span className="flex-1 h-[1px] bg-white/10" />
                            </h4>

                            <div className="grid grid-cols-1 gap-4">
                                {sortedAlbuns.map((album, index) => (
                                    <div key={album.id} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center">
                                        <div className="flex md:flex-col gap-2 bg-white/5 p-2 rounded-2xl border border-white/5 order-last md:order-first w-full md:w-auto justify-center">
                                            <button
                                                onClick={() => handleMoveAlbum(album.id, 'up', sortedAlbuns)}
                                                disabled={index === 0}
                                                className="p-2 hover:bg-white/10 rounded-xl transition-all disabled:opacity-20"
                                            >
                                                <FiArrowUp size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleMoveAlbum(album.id, 'down', sortedAlbuns)}
                                                disabled={index === sortedAlbuns.length - 1}
                                                className="p-2 hover:bg-white/10 rounded-xl transition-all disabled:opacity-20"
                                            >
                                                <FiArrowDown size={16} />
                                            </button>
                                        </div>

                                        <div className="flex-1 w-full">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-lg font-bold">{album.titulo}</h4>
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${album.isForSale ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                                        {album.isForSale ? 'Venda Ativa' : 'Exposição'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setManagedAlbum(album);
                                                                setActiveTab('gerenciar_album');
                                                                refreshAlbumPhotos(album.id);
                                                            }}
                                                            className="flex items-center gap-2 bg-white/5 hover:bg-white text-gray-500 hover:text-black border border-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                                                        >
                                                            <FiSettings /> GERENCIAR
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedAlbumForCover(album)}
                                                            className="flex items-center gap-2 bg-white/5 hover:bg-blue-600 text-gray-500 hover:text-white border border-white/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                                                        >
                                                            <FiImage /> CAPAS
                                                        </button>
                                                    </div>
                                                    <button onClick={() => handleDeleteAlbum(album.id, album.titulo)} className="p-2 hover:text-red-500 transition-colors">
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                {album.isForSale && (
                                                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 animate-in fade-in scale-in-95 duration-300">
                                                        <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Preço Base</p>
                                                        <p className="font-mono text-sm leading-none">R$ {(album.basePrice ?? 0).toFixed(2)}</p>
                                                    </div>
                                                )}
                                                <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Fotos Total</p>
                                                    <p className="font-mono text-sm leading-none">{album._count?.Image || 0}</p>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Modelo</p>
                                                    <p className="text-[10px] leading-none flex items-center gap-1">
                                                        {album.isPrivate ? <><FiLock className="size-3 text-yellow-600" /> Privado</> : 'Público'}
                                                    </p>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                                    <p className="text-[8px] text-gray-500 uppercase font-black mb-1">Posição</p>
                                                    <p className="font-mono text-sm leading-none">#{album.ordem || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
