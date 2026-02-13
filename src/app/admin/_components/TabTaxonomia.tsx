import { useRef, useState } from 'react';
import { FiGrid, FiMove, FiPlus, FiTag, FiTrash2, FiX } from 'react-icons/fi';

interface TabTaxonomiaProps {
    dbCategories: { id: string, name: string, ordem: number }[];
    dbTags: { id: string, name: string, ordem: number }[];
    allTagsList: string[];
    selectedTags: string[];
    handleTagChange: (tag: string) => void;
    handleReorderCategories: (newCategories: any[]) => void;
    handleReorderTags: (newTags: any[]) => void;
    handleAddCategory: (name: string) => void;
    handleDeleteCategory: (id: string) => void;
    handleAddTag: (name: string) => void;
    handleDeleteTag: (id: string) => void;
}

export const TabTaxonomia = ({
    dbCategories,
    dbTags,
    allTagsList,
    selectedTags,
    handleTagChange,
    handleReorderCategories,
    handleReorderTags,
    handleAddCategory,
    handleDeleteCategory,
    handleAddTag,
    handleDeleteTag
}: TabTaxonomiaProps) => {
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [newCatName, setNewCatName] = useState('');
    const [newTagName, setNewTagName] = useState('');

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
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Categorias Section */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-10 space-y-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <FiGrid className="text-blue-500" /> Categorias do Site
                    </h3>
                    <div className="flex gap-2 w-full md:w-auto">
                        <input
                            value={newCatName}
                            onChange={e => setNewCatName(e.target.value)}
                            placeholder="Nova Categoria..."
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500/50 transition-all font-bold w-full md:w-64"
                        />
                        <button
                            onClick={() => { if (newCatName) { handleAddCategory(newCatName); setNewCatName(''); } }}
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 transition-all disabled:opacity-50"
                            disabled={!newCatName}
                        >
                            <FiPlus />
                        </button>
                    </div>
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
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-600 hover:text-red-500 p-1">
                                    <FiTrash2 size={12} />
                                </button>
                                <FiMove size={12} className="text-gray-700 group-hover:text-blue-500 transition-colors" />
                            </div>
                        </div>
                    ))}
                    {dbCategories.length === 0 && (
                        <p className="text-xs text-gray-600 italic col-span-full">Nenhuma categoria cadastrada no banco.</p>
                    )}
                </div>
            </div>

            {/* Tags Section */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-10 space-y-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <FiTag className="text-purple-500" /> Tags & Filtros
                    </h3>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={async () => {
                                if (confirm('Isso irá ler todos os álbuns e adicionar suas tags ao banco de dados. Continuar?')) {
                                    try {
                                        const res = await fetch('/api/admin/tags/migrate', { method: 'POST' });
                                        if (res.ok) {
                                            const data = await res.json();
                                            alert(`Migração concluída! Tags processadas: ${data.count}. Recarregue a página.`);
                                        }
                                    } catch (e) {
                                        alert('Erro na migração');
                                    }
                                }
                            }}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white rounded-xl px-4 py-2 text-xs font-bold uppercase transition-all"
                        >
                            Sincronizar Legacy
                        </button>
                        <input
                            value={newTagName}
                            onChange={e => setNewTagName(e.target.value)}
                            placeholder="Nova Tag..."
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-purple-500/50 transition-all font-bold w-full md:w-64"
                        />
                        <button
                            onClick={() => { if (newTagName) { handleAddTag(newTagName); setNewTagName(''); } }}
                            className="bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-4 py-2 transition-all disabled:opacity-50"
                            disabled={!newTagName}
                        >
                            <FiPlus />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Tags do Banco (Principal) */}
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
                                        <button onClick={() => handleDeleteTag(tag.id)} className="text-gray-600 hover:text-red-500 transition-all p-1">
                                            <FiTrash2 size={14} />
                                        </button>
                                        <FiMove size={12} className="text-gray-800 group-hover:text-purple-500 transition-colors" />
                                    </div>
                                </div>
                            ))}
                            {dbTags.length === 0 && <p className="text-xs text-gray-700 italic">Nenhuma tag customizada cadastrada.</p>}
                        </div>
                    </div>

                    {/* Quick Access (Read-only view of what's available globally including static/legacy) */}
                    <div className="space-y-6 opacity-60 hover:opacity-100 transition-opacity">
                        <h4 className="text-[10px] text-gray-500 uppercase font-black px-1 tracking-widest italic">Todas as Tags Encontradas (Legado + Banco)</h4>
                        <div className="flex flex-wrap gap-2">
                            {allTagsList.map(tag => (
                                <span
                                    key={tag}
                                    className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase border border-white/5 bg-white/5 text-gray-400 cursor-default`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
