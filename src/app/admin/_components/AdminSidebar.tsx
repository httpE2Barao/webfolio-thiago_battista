import { TabType } from '../_hooks/useAdminData';

interface SidebarItemProps {
    icon: any;
    label: string;
    active: boolean;
    onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
    <button
        onClick={onClick}
        className={`shrink-0 lg:w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all border-b-2 lg:border-b-0 lg:border-r-2 ${active
            ? 'bg-white/5 text-white border-white'
            : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/[0.02]'
            }`}
    >
        <Icon size={18} />
        <span className="uppercase tracking-tighter">{label}</span>
    </button>
);

interface AdminSidebarProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    handleLogout: () => void;
    menuItems: { id: TabType; label: string; icon: any }[];
    FiUser: any;
    FiX: any;
}

export const AdminSidebar = ({
    activeTab,
    setActiveTab,
    handleLogout,
    menuItems,
    FiUser,
    FiX
}: AdminSidebarProps) => {
    return (
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/5 bg-[#050505] flex flex-col rounded-3xl lg:sticky top-0 z-40 h-auto lg:h-screen overflow-hidden shrink-0">
            <div className="p-6 lg:p-8 border-b border-white/5 flex items-center justify-between lg:flex-col lg:items-start lg:justify-start">
                <div>
                    <h1 className="text-xl lg:text-2xl font-black tracking-tighter uppercase mb-1">Administração</h1>
                    <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest hidden sm:block">Thiago Battista • Fotógrafo</p>
                </div>
                <div className="lg:hidden flex items-center gap-3">
                    <button
                        onClick={handleLogout}
                        className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20"
                    >
                        <FiX size={12} /> Sair
                    </button>
                </div>
            </div>

            <nav className="flex-none lg:flex-1 py-0 lg:py-6 flex flex-row overflow-x-auto lg:flex-col thin-scrollbar items-center lg:items-stretch">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        active={activeTab === item.id}
                        onClick={() => setActiveTab(item.id)}
                    />
                ))}
            </nav>

            <div className="hidden lg:block p-6 border-t border-white/5 bg-black/40">
                <div className="flex items-center gap-4 px-2">
                    <div className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                        <FiUser size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">Thiago Battista</p>
                        <button
                            onClick={handleLogout}
                            className="text-[9px] font-black uppercase text-gray-600 hover:text-red-500 transition-colors flex items-center gap-1"
                        >
                            <FiX size={10} /> Encerrar Sessão
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};
