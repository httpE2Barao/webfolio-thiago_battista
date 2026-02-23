import { useEffect, useState } from 'react';
import { FiSave, FiUser, FiFileText } from 'react-icons/fi';

export const TabBio = () => {
    const [content, setContent] = useState('');
    const [cvUrl, setCvUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchBio();
    }, []);

    const fetchBio = async () => {
        try {
            const res = await fetch('/api/admin/bio');
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setContent(data.content || '');
                    setCvUrl(data.cvUrl || '');
                }
            }
        } catch (error) {
            console.error("Error fetching bio:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setStatusMessage(null);
        try {
            const res = await fetch('/api/admin/bio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, cvUrl }),
            });

            if (res.ok) {
                setStatusMessage({ type: 'success', text: 'Sobre mim atualizado com sucesso!' });
            } else {
                setStatusMessage({ type: 'error', text: 'Erro ao salvar as alterações.' });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Erro de conexão ao salvar.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin size-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-10 space-y-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <FiUser className="text-blue-500" /> Editar Sobre Mim
                    </h3>

                    {statusMessage && (
                        <div className={`px-6 py-2 rounded-xl border text-[10px] font-bold ${statusMessage.type === 'success'
                                ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}>
                            {statusMessage.text}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 uppercase font-black px-1 tracking-widest italic">Biografia (Texto Principal)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded-2xl p-6 text-sm text-gray-300 outline-none focus:border-blue-500/50 transition-all min-h-[400px] leading-relaxed font-mono"
                            placeholder="Conte sua história aqui..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 uppercase font-black px-1 tracking-widest italic flex items-center gap-2">
                            <FiFileText size={10} /> Link do Currículo (PDF)
                        </label>
                        <input
                            type="text"
                            value={cvUrl}
                            onChange={(e) => setCvUrl(e.target.value)}
                            className="w-full bg-[#050505] border border-white/10 rounded-2xl px-6 py-4 text-sm text-gray-300 outline-none focus:border-blue-500/50 transition-all font-mono"
                            placeholder="/Curriculo.pdf"
                        />
                        <p className="text-[9px] text-gray-600 px-1">O arquivo deve estar na pasta public do projeto. Ex: /Curriculo.pdf</p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 py-4 rounded-2xl transition-all uppercase flex items-center gap-2 disabled:opacity-50"
                        >
                            <FiSave />
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
