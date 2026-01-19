"use client";

import { Header } from '@/components/Header';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiLock, FiMail, FiPhone, FiShoppingCart, FiUser } from 'react-icons/fi';

export default function CheckoutPage() {
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
    const [albumId, setAlbumId] = useState('');
    const [customerData, setCustomerData] = useState({
        name: '',
        email: '',
        phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const photos = localStorage.getItem('selectedPhotos');
        const id = localStorage.getItem('albumId');
        if (photos) setSelectedPhotos(JSON.parse(photos));
        if (id) setAlbumId(id);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/loja/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    albumId,
                    customerData,
                    selectedImageIds: selectedPhotos,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao processar checkout');

            // Redirecionar para o Mercado Pago
            window.location.href = data.init_point;
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    if (selectedPhotos.length === 0) {
        return (
            <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h1>
                <Link href="/loja" className="text-blue-500 hover:underline">Voltar para a loja</Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Header />

            <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-12">
                    <Link href={`/loja/${albumId}`} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <FiArrowLeft size={24} />
                    </Link>
                    <h1 className="text-3xl font-black tracking-tighter uppercase">Finalizar Pedido</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Formulário */}
                    <section>
                        <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FiUser className="text-gray-500" />
                                Dados do Cliente
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase font-bold mb-2 ml-1">Nome Completo</label>
                                    <div className="relative">
                                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-white/30 outline-none transition-colors"
                                            placeholder="Thiago Battista"
                                            value={customerData.name}
                                            onChange={e => setCustomerData({ ...customerData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 uppercase font-bold mb-2 ml-1">E-mail para entrega</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-white/30 outline-none transition-colors"
                                            placeholder="seu@email.com"
                                            value={customerData.email}
                                            onChange={e => setCustomerData({ ...customerData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 uppercase font-bold mb-2 ml-1">WhatsApp (Opcional)</label>
                                    <div className="relative">
                                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="tel"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:border-white/30 outline-none transition-colors"
                                            placeholder="(11) 99999-9999"
                                            value={customerData.phone}
                                            onChange={e => setCustomerData({ ...customerData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        'PROCESSANDO...'
                                    ) : (
                                        <>
                                            PAGAR AGORA
                                            <FiLock className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <p className="text-[10px] text-center text-gray-500 flex items-center justify-center gap-1">
                                    <FiLock size={10} />
                                    Pagamento 100% seguro via Mercado Pago
                                </p>
                            </form>
                        </div>
                    </section>

                    {/* Resumo */}
                    <aside>
                        <div className="bg-white/5 border border-white/5 p-8 rounded-3xl h-fit sticky top-32">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FiShoppingCart className="text-gray-500" />
                                Resumo da Seleção
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Total de Fotos</span>
                                    <span className="font-mono">{selectedPhotos.length}</span>
                                </div>

                                {/* Aqui poderíamos ter mais detalhes se tivéssemos o objeto do álbum */}
                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-[10px] text-gray-500 uppercase mb-4 tracking-widest">Suas fotos serão enviadas por e-mail após a confirmação do pagamento.</p>
                                </div>
                            </div>

                            <div className="bg-white/5 p-6 rounded-2xl text-center border border-white/5">
                                <p className="text-xs text-gray-400 mb-1 uppercase tracking-tighter">Total a Pagar</p>
                                <p className="text-4xl font-black">Cálculo na API</p>
                                <p className="text-[10px] text-gray-500 mt-2">O valor final é calculado com base nas regras do álbum selecionado.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
