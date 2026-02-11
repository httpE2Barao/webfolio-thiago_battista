import { useRef } from 'react';
import { FiGrid, FiMove, FiTag, FiX } from 'react-icons/fi';

interface TabTaxonomiaProps {
    dbCategories: { id: string, name: string, ordem: number }[];
    dbTags: { id: string, name: string, ordem: number }[];
    allTagsList: string[];
    selectedTags: string[];
    handleTagChange: (tag: string) => void;
    handleReorderCategories: (newCategories: any[]) => void;
    handleReorderTags: (newTags: any[]) => void;
}

export const TabTaxonomia = ({
    dbCategories,
    dbTags,
    allTagsList,
    selectedTags,
    handleTagChange,
    handleReorderCategories,
    handleReorderTags
}: TabTaxonomiaProps) => {
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleSort = (type: 'categories' | 'tags') => {
        if (dragItem.current === null || dragOverItem.current === null) return;

        if (type === 'categories') {
            const items = [...dbCategories];
            const draggedItemContent = items[dragItem.current];
            items.splice(dragItem.current, 1);
            items.splice(dragOverItem.current, 0, draggedItemContent);
            handleReorderCategories(items);
        } else {
            const items = [...dbTags];
            const draggedItemContent = items[dragItem.current];
            items.splice(dragItem.current, 1);
            items.splice(dragOverItem.current, 0, draggedItemContent);
            handleReorderTags(items);
        }

        dragItem.current = null;
        dragOverItem.current = null;
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Categorias Section */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-10 space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <FiGrid className="text-blue-500" /> Categorias do Site
                    </h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase italic tracking-widest">Arraste para ordenar no menu</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {dbCategories.map((cat, index) => (
                        <div
                            key={cat.id}
                            draggable
                            onDragStart={() => dragItem.current = index}
                            onDragEnter={() => dragOverItem.current = index}
                            onDragEnd={() => handleSort('categories')}
                            onDragOver={(e) => e.preventDefault()}
                            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group cursor-move hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-gray-600">#{index + 1}</span>
                                <span className="text-xs font-bold uppercase tracking-tight">{cat.name}</span>
                            </div>
                            <FiMove size={12} className="text-gray-700 group-hover:text-blue-500 transition-colors" />
                        </div>
                    ))}
                    {dbCategories.length === 0 && (
                        <p className="text-xs text-gray-600 italic col-span-full">Nenhuma categoria cadastrada no banco.</p>
                    )}
                </div>
            </div>

            {/* Tags Section */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-10 space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <FiTag className="text-purple-500" /> Tags & Filtros
                    </h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase italic tracking-widest">Arraste para definir prioridade</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h4 className="text-[10px] text-gray-500 uppercase font-black px-1 tracking-widest italic">Tags Rápidas (Estáticas)</h4>
                        <div className="flex flex-wrap gap-2">
                            {allTagsList.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagChange(tag)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${selectedTags.includes(tag)
                                        ? 'bg-white text-black border-white'
                                        : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] text-gray-500 uppercase font-black px-1 tracking-widest italic">Gerenciar Tags (Banco)</h4>
                        <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 min-h-[400px] space-y-2">
                            {dbTags.map((tag, index) => (
                                <div
                                    key={tag.id}
                                    draggable
                                    onDragStart={() => dragItem.current = index}
                                    onDragEnter={() => dragOverItem.current = index}
                                    onDragEnd={() => handleSort('tags')}
                                    onDragOver={(e) => e.preventDefault()}
                                    className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl group cursor-move hover:border-purple-500/50 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] items-center justify-center flex w-5 h-5 bg-white/5 rounded-md font-mono text-gray-600">{index + 1}</span>
                                        <span className="text-xs font-bold text-gray-300 uppercase">{tag.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleTagChange(tag.name)} className="text-gray-600 hover:text-red-500 transition-all p-1">
                                            <FiX size={14} />
                                        </button>
                                        <FiMove size={12} className="text-gray-800 group-hover:text-purple-500 transition-colors" />
                                    </div>
                                </div>
                            ))}
                            {dbTags.length === 0 && <p className="text-xs text-gray-700 italic">Nenhuma tag customizada cadastrada.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
