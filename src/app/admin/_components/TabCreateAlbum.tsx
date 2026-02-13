
import { FiPlus, FiUpload, FiX } from 'react-icons/fi';
import { Toggle } from './Toggle';

interface TabCreateAlbumProps {
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
}

export const TabCreateAlbum = ({
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
    handleUpload
}: TabCreateAlbumProps) => {

    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedCategoria(e.target.value);
    };

    const isNewCategory = selectedCategoria && !allCategoriesList.includes(selectedCategoria);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Seção de Upload */}
            <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-3xl">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <FiPlus className="text-gray-500" /> Criar Novo Álbum
                </h3>
                <form onSubmit={handleUpload} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col gap-2 relative group">
                            <span className="text-[10px] text-gray-500 uppercase font-black ml-1">Categoria</span>
                            <div className="relative">
                                <input
                                    list="categories-list"
                                    value={selectedCategoria}
                                    onChange={handleCategoryChange}
                                    placeholder="Selecione ou digite nova..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-white/30 transition-all text-sm font-bold"
                                    required
                                />
                                {isNewCategory && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full pointer-events-none">
                                        Nova
                                    </div>
                                )}
                            </div>
                            <datalist id="categories-list">
                                {allCategoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </datalist>
                            <p className="text-[9px] text-gray-600 mt-1 pl-1">
                                Digite o nome de uma categoria existente ou crie uma nova.
                            </p>
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
        </div>
    );
};
