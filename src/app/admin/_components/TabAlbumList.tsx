
import { FiArrowDown, FiArrowUp, FiGrid, FiImage, FiLock, FiSettings, FiTrash2 } from 'react-icons/fi';
import { AlbumSalesConfig } from '../_hooks/useAdminData';

interface TabAlbumListProps {
    albuns: AlbumSalesConfig[];
    handleMoveAlbum: (id: string, dir: 'up' | 'down', list: any[]) => void;
    handleDeleteAlbum: (id: string, title: string) => void;
    setSelectedAlbumForCover: (album: any) => void;
    setActiveTab: (tab: any) => void;
    setManagedAlbum: (album: any) => void;
    refreshAlbumPhotos: (albumId: string, force: boolean) => void;
}

export const TabAlbumList = ({
    albuns,
    handleMoveAlbum,
    handleDeleteAlbum,
    setSelectedAlbumForCover,
    setActiveTab,
    setManagedAlbum,
    refreshAlbumPhotos
}: TabAlbumListProps) => {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                                                                // Also refresh the photos for this album specifically before switching tab
                                                                refreshAlbumPhotos(album.id, true);
                                                                setActiveTab('gerenciar_album');
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
