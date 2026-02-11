import { getAdminThumbUrl } from '@/lib/cloudinaryOptimize';
import { useEffect, useState } from 'react';
import { FiActivity, FiMonitor, FiSmartphone, FiX } from 'react-icons/fi';
import { AlbumSalesConfig } from '../_hooks/useAdminData';

interface CoverManagerModalProps {
    selectedAlbumForCover: AlbumSalesConfig | any;
    setSelectedAlbumForCover: (album: any) => void;
    coverType: 'desktop' | 'mobile';
    setCoverType: (type: 'desktop' | 'mobile') => void;
    albumPhotos: any[];
    isPhotoLoading: boolean;
    handleSetCover: (albumId: string, path: string, pos?: string) => void;
}

const PhotoSkeleton = () => (
    <div className="aspect-square bg-white/5 rounded-xl animate-pulse flex items-center justify-center">
        <FiActivity className="text-white/10" size={20} />
    </div>
);

export const CoverManagerModal = ({
    selectedAlbumForCover,
    setSelectedAlbumForCover,
    coverType,
    setCoverType,
    albumPhotos,
    isPhotoLoading,
    handleSetCover
}: CoverManagerModalProps) => {
    const [localAlignment, setLocalAlignment] = useState(50);

    useEffect(() => {
        if (selectedAlbumForCover) {
            const posStr = coverType === 'desktop'
                ? selectedAlbumForCover?.coverImageDesktopPosition
                : selectedAlbumForCover?.coverImageMobilePosition;

            if (posStr && posStr.includes('%')) {
                setLocalAlignment(parseInt(posStr));
            } else {
                setLocalAlignment(posStr === 'top' ? 0 : posStr === 'bottom' ? 100 : 50);
            }
        }
    }, [selectedAlbumForCover, coverType]);

    if (!selectedAlbumForCover) return null;

    const currentPath = coverType === 'desktop'
        ? selectedAlbumForCover?.coverImageDesktop
        : selectedAlbumForCover?.coverImageMobile;

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="bg-[#050505] border border-white/10 w-full max-w-7xl max-h-[95vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative">
                {/* Top Header */}
                <div className="px-8 py-6 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-black/40">
                    <div className="flex-1 space-y-1">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Ajuste de Capa</h2>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{selectedAlbumForCover.titulo}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                            <button
                                onClick={() => setCoverType('desktop')}
                                className={`flex items-center gap-2 text-[10px] font-black uppercase px-6 py-2.5 rounded-xl transition-all ${coverType === 'desktop' ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <FiMonitor /> Desktop
                            </button>
                            <button
                                onClick={() => setCoverType('mobile')}
                                className={`flex items-center gap-2 text-[10px] font-black uppercase px-6 py-2.5 rounded-xl transition-all ${coverType === 'mobile' ? 'bg-white text-black' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <FiSmartphone /> Mobile
                            </button>
                        </div>

                        <div className="flex-1 lg:flex-none flex flex-col gap-1 min-w-[200px]">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[8px] uppercase font-black text-blue-500 tracking-widest">Alinhamento Vertical: {localAlignment}%</span>
                            </div>
                            <input
                                type="range" min="0" max="100" value={localAlignment}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setLocalAlignment(val);
                                    if (currentPath) handleSetCover(selectedAlbumForCover.id, currentPath, `${val}%`);
                                }}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    </div>

                    <button onClick={() => setSelectedAlbumForCover(null)} className="absolute top-6 right-8 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 thin-scrollbar bg-[#050505]">
                    <div className="mb-8 flex items-center justify-between">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">Galeria do Álbum</p>
                        <div className="h-[1px] flex-1 bg-white/5 mx-6" />
                        <p className="text-[10px] text-gray-600 font-mono">{albumPhotos.length} IMAGENS DISPONÍVEIS</p>
                    </div>

                    {isPhotoLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            {[...Array(16)].map((_, i) => <PhotoSkeleton key={i} />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            {albumPhotos.map((photo) => {
                                const isCurrentCover = coverType === 'desktop'
                                    ? selectedAlbumForCover?.coverImageDesktop === photo.path
                                    : selectedAlbumForCover?.coverImageMobile === photo.path;

                                return (
                                    <div
                                        key={photo.id}
                                        onClick={() => handleSetCover(selectedAlbumForCover!.id, photo.path, `${localAlignment}%`)}
                                        className={`relative aspect-square cursor-pointer rounded-2xl overflow-hidden group border-4 transition-all ${isCurrentCover ? 'border-blue-500 shadow-2xl scale-95' : 'border-transparent hover:border-white/20'}`}
                                    >
                                        <img
                                            src={getAdminThumbUrl(photo.path)}
                                            alt=""
                                            className="w-full h-full object-cover text-[0px]"
                                            loading="lazy"
                                        />
                                        {isCurrentCover && (
                                            <div className="absolute inset-0 bg-blue-500/10 flex flex-col items-center justify-end p-2">
                                                <div className="w-full bg-blue-500 text-white text-[8px] font-black py-1.5 rounded-lg shadow-xl text-center uppercase">
                                                    EM USO
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]">
                                            <span className="text-[9px] font-black uppercase text-white bg-black/60 px-3 py-2 rounded-lg border border-white/10">
                                                {isCurrentCover ? 'Alterar Foto' : 'Usar como Capa'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {albumPhotos.length === 0 && (
                                <div className="col-span-full py-40 flex flex-col items-center justify-center gap-4">
                                    <FiActivity size={48} className="text-gray-800" />
                                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Nenhuma foto encontrada</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
