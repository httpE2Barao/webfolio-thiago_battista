import { FiShoppingCart } from 'react-icons/fi';
import { Order } from '../_hooks/useAdminData';

interface TabPedidosProps {
    orders: Order[];
}

export const TabPedidos = ({ orders }: TabPedidosProps) => {
    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-10">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <FiShoppingCart className="text-gray-500" /> Histórico de Pedidos
            </h3>
            <div className="overflow-x-auto overflow-y-visible thin-scrollbar pb-6 -mx-4 px-4 md:mx-0 md:px-0">
                <table className="w-full min-w-[800px] border-separate border-spacing-y-3">
                    <thead>
                        <tr className="text-[10px] text-gray-500 uppercase font-black tracking-widest text-left">
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Cliente / Email</th>
                            <th className="px-6 py-4">Álbum</th>
                            <th className="px-6 py-4">Fotos</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="group bg-white/5 hover:bg-white/[0.08] transition-all">
                                <td className="px-6 py-5 first:rounded-l-2xl">
                                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${order.status === 'PAID' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        {order.status === 'PAID' ? 'Pago' : 'Pendente'}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-xs font-bold text-white mb-0.5">{order.customerName}</p>
                                    <p className="text-[10px] text-gray-500">{order.customerEmail}</p>
                                </td>
                                <td className="px-6 py-5 text-xs text-gray-300 font-bold uppercase tracking-tight">
                                    {order.Album?.titulo || order.id}
                                </td>
                                <td className="px-6 py-5 text-xs font-mono">{order.totalPhotos}</td>
                                <td className="px-6 py-5 text-xs font-black text-white">R$ {order.totalPrice.toFixed(2)}</td>
                                <td className="px-6 py-5 last:rounded-r-2xl text-[10px] text-gray-500 font-mono italic">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-20 text-gray-600 text-sm">
                                    Nenhum pedido encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
