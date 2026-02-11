import { FiActivity, FiDollarSign, FiGrid, FiShoppingCart } from 'react-icons/fi';
import { Order } from '../_hooks/useAdminData';

interface TabOverviewProps {
    stats: {
        totalRevenue: number;
        totalAlbuns: number;
        totalPhotos: number;
        totalOrders: number;
    };
    orders: Order[];
    setActiveTab: (tab: any) => void;
    FiUpload: any;
    FiPlus: any;
    FiTag: any;
}

const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl hover:border-white/10 transition-all group">
        <div className={`size-12 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black tracking-tight">{value}</h3>
    </div>
);

export const TabOverview = ({
    stats,
    orders,
    setActiveTab,
    FiUpload,
    FiPlus,
    FiTag
}: TabOverviewProps) => {
    return (
        <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={FiDollarSign} label="Receita Bruta" value={`R$ ${stats.totalRevenue.toFixed(2)}`} color="bg-green-500/10 text-green-500" />
                <StatCard icon={FiGrid} label="Álbuns Criados" value={stats.totalAlbuns} color="bg-blue-500/10 text-blue-500" />
                <StatCard icon={FiActivity} label="Fotos no Acervo" value={stats.totalPhotos} color="bg-purple-500/10 text-purple-500" />
                <StatCard icon={FiShoppingCart} label="Vendas Totais" value={stats.totalOrders} color="bg-orange-500/10 text-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Atividade Recente */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
                        <FiActivity className="text-gray-500" /> Atividade Recente
                    </h3>
                    <div className="space-y-4">
                        {orders.slice(0, 5).map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-white mb-0.5">{order.customerName}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-black">Álbum: {order.Album?.titulo || 'Removido'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-green-500">R$ {order.totalPrice.toFixed(2)}</p>
                                    <p className="text-[10px] text-gray-500 font-mono italic">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && <p className="text-center py-8 text-gray-600 text-sm">Nenhuma atividade recente.</p>}
                    </div>
                </div>

                {/* Ações Rápidas */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <FiPlus className="text-gray-500" /> Ações Rápidas
                    </h3>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => setActiveTab('albuns')} className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left transition-all flex items-center justify-between group">
                            <span className="text-xs font-bold uppercase">Novo Álbum</span>
                            <FiUpload size={14} className="group-hover:translate-x-1 transition-all" />
                        </button>
                        <button onClick={() => setActiveTab('taxonomia')} className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left transition-all flex items-center justify-between group">
                            <span className="text-xs font-bold uppercase">Gerenciar Tags</span>
                            <FiTag size={14} className="group-hover:translate-x-1 transition-all" />
                        </button>
                        <button onClick={() => setActiveTab('pedidos')} className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left transition-all flex items-center justify-between group">
                            <span className="text-xs font-bold uppercase">Ver Pedidos</span>
                            <FiShoppingCart size={14} className="group-hover:translate-x-1 transition-all" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
