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

    if (!selectedAlbumForCover) return null;

    const currentPath = coverType === 'desktop'
        ? selectedAlbumForCover?.coverImageDesktop
        : selectedAlbumForCover?.coverImageMobile;

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="bg-[#050505] border border-white/10 w-full max-w-7xl max-h-[95vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative">
                {/* Top Header */}
                <div className="px-8 py-6 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-black/40 pr-24 relative">
                    <div className="flex-1 space-y-1">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Ajuste de Capa</h2>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{selectedAlbumForCover.titulo}</p>
                    </div>

                    <div className="flex flex-col gap-4 w-full lg:w-auto items-center lg:items-end">
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

                        {/* Interactive Preview for Positioning */}
                        {currentPath && (
                            <div className="relative group border border-white/10 rounded-lg overflow-hidden shadow-2xl select-none">
                                <p className="absolute top-2 left-2 z-20 text-[8px] font-black text-white/50 bg-black/50 px-2 py-1 rounded backdrop-blur-md pointer-events-none">
                                    CLIQUE PARA DEFINIR O FOCO
                                </p>

                                <div
                                    className="relative cursor-crosshair"
                                    onClick={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                                        const newPos = `${x.toFixed(0)}% ${y.toFixed(0)}%`;

                                        // Update local state is not strictly needed if we update via handleSetCover which updates parent, 
                                        // but for smoothness we might strictly rely on parent props or local state if we want to defer save.
                                        // The current architecture seems to save immediately via handleSetCover.
                                        handleSetCover(selectedAlbumForCover.id, currentPath, newPos);
                                    }}
                                    style={{
                                        width: coverType === 'desktop' ? '320px' : '180px', // Scaled down preview
                                        aspectRatio: coverType === 'desktop' ? '16/9' : '9/16', // Adjust to match typical use
                                    }}
                                >
                                    <img
                                        src={getAdminThumbUrl(currentPath)}
                                        alt="Preview"
                                        className="w-full h-full object-cover pointer-events-none"
                                        style={{
                                            objectPosition: coverType === 'desktop'
                                                ? (selectedAlbumForCover.coverImageDesktopPosition || '50% 50%')
                                                : (selectedAlbumForCover.coverImageMobilePosition || '50% 50%')
                                        }}
                                    />

                                    {/* Crosshair/Dot */}
                                    <div
                                        className="absolute w-3 h-3 bg-red-500 rounded-full border border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
                                        style={{
                                            left: (coverType === 'desktop' ? selectedAlbumForCover.coverImageDesktopPosition : selectedAlbumForCover.coverImageMobilePosition)?.split(' ')[0] || '50%',
                                            top: (coverType === 'desktop' ? selectedAlbumForCover.coverImageDesktopPosition : selectedAlbumForCover.coverImageMobilePosition)?.split(' ')[1] || '50%',
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={() => setSelectedAlbumForCover(null)} className="absolute top-6 right-8 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all z-50 shadow-xl">
                        <FiX size={24} />
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
                                        onClick={() => {
                                            // Keep existing position if possible, otherwise default to 50% 50%
                                            const currentPos = coverType === 'desktop'
                                                ? (selectedAlbumForCover.coverImageDesktopPosition || '50% 50%')
                                                : (selectedAlbumForCover.coverImageMobilePosition || '50% 50%');
                                            handleSetCover(selectedAlbumForCover!.id, photo.path, currentPos);
                                        }}
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
