
import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiMonitor, FiSmartphone, FiX } from 'react-icons/fi';

interface ImagePositionModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrlDesktop: string;
    imageUrlMobile?: string;
    initialPositionDesktop: string;
    initialPositionMobile: string;
    onSave: (posDesktop: string, posMobile: string) => Promise<void>;
}

export const ImagePositionModal = ({
    isOpen,
    onClose,
    imageUrlDesktop,
    imageUrlMobile,
    initialPositionDesktop,
    initialPositionMobile,
    onSave
}: ImagePositionModalProps) => {
    const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');
    const [posDesktop, setPosDesktop] = useState(initialPositionDesktop || '50% 50%');
    const [posMobile, setPosMobile] = useState(initialPositionMobile || '50% 50%');
    const [isSaving, setIsSaving] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setPosDesktop(initialPositionDesktop || '50% 50%');
            setPosMobile(initialPositionMobile || '50% 50%');
        }
    }, [isOpen, initialPositionDesktop, initialPositionMobile]);

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newPos = `${x.toFixed(0)}% ${y.toFixed(0)}%`;

        if (mode === 'desktop') {
            setPosDesktop(newPos);
        } else {
            setPosMobile(newPos);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(posDesktop, posMobile);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const currentImage = mode === 'desktop' ? imageUrlDesktop : (imageUrlMobile || imageUrlDesktop);
    const currentPos = mode === 'desktop' ? posDesktop : posMobile;

    // Helper to get coordinates for the dot
    const getDotCoords = (posString: string) => {
        const [x, y] = posString.split(' ').map(s => parseFloat(s));
        return { left: `${x}%`, top: `${y}%` };
    };

    const dotStyle = getDotCoords(currentPos);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
            <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        Ajustar Recorte / Foco
                        <div className="flex bg-white/5 rounded-lg p-1 gap-1">
                            <button
                                onClick={() => setMode('desktop')}
                                className={`p-2 rounded-md transition-all ${mode === 'desktop' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                title="Desktop"
                            >
                                <FiMonitor size={18} />
                            </button>
                            <button
                                onClick={() => setMode('mobile')}
                                className={`p-2 rounded-md transition-all ${mode === 'mobile' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                title="Mobile"
                            >
                                <FiSmartphone size={18} />
                            </button>
                        </div>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto bg-[#050505] p-8 flex items-center justify-center relative">
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-sm text-gray-500 font-mono text-center mb-2 uppercase tracking-widest">
                            Clique na imagem para definir o ponto de foco ({mode})
                        </p>

                        <div
                            ref={containerRef}
                            className="relative cursor-crosshair group shadow-2xl border border-white/10 rounded-lg overflow-hidden select-none"
                            onClick={handleImageClick}
                            style={{
                                width: mode === 'desktop' ? '600px' : '300px',
                                maxWidth: '100%',
                                aspectRatio: mode === 'desktop' ? '16/9' : '3/4', // Approximate aspect ratios
                            }}
                        >
                            <img
                                src={currentImage}
                                alt="Preview"
                                className="w-full h-full object-cover pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"
                                style={{ objectPosition: currentPos }}
                            />
                            {/* Overlay to show the full image slightly to guide user */}
                            <img
                                src={currentImage}
                                alt="Full"
                                className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-20"
                            />

                            {/* The Focus Point Dot */}
                            <div
                                className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 pointer-events-none z-10"
                                style={dotStyle}
                            />

                            {/* Guidelines */}
                            <div className="absolute inset-x-0 top-1/2 h-px bg-white/20 pointer-events-none" />
                            <div className="absolute inset-y-0 left-1/2 w-px bg-white/20 pointer-events-none" />
                        </div>

                        <div className="mt-4 font-mono text-xs text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                            Position: {currentPos}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-[#0a0a0a]">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-bold transition-all text-sm uppercase tracking-wide">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20 text-sm uppercase tracking-wide"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        <FiCheck />
                    </button>
                </div>
            </div>
        </div>
    );
};
