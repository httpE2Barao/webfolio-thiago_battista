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
        className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-bold transition-all border-r-2 ${active
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
        <aside className="w-80 border-r border-white/5 bg-[#050505] flex flex-col rounded-3xl sticky top-0 h-screen overflow-y-auto thin-scrollbar">
            <div className="p-8 border-b border-white/5">
                <h1 className="text-2xl font-black tracking-tighter uppercase mb-1">Administração</h1>
                <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Thiago Battista • Fotógrafo</p>
            </div>

            <nav className="flex-1 py-6">
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

            <div className="p-6 border-t border-white/5 bg-black/40">
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
