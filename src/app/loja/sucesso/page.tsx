"use client";

import { Header } from '@/components/Header';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { FiCheckCircle, FiHeart, FiMail, FiShoppingCart } from 'react-icons/fi';

function SucessoContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        // Limpar carrinho local
        localStorage.removeItem('selectedPhotos');
        localStorage.removeItem('albumId');
    }, []);

    return (
        <div className="pt-40 pb-20 px-4 max-w-2xl mx-auto text-center">
            <div className="inline-flex p-6 bg-green-500/10 rounded-full mb-8">
                <FiCheckCircle className="text-7xl text-green-500" />
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">OBRIGADO PELO PEDIDO!</h1>

            <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl mb-12 shadow-2xl text-left">
                <p className="text-gray-400 mb-6 leading-relaxed">
                    Seu pagamento foi confirmado com sucesso. O ID do seu pedido é <strong className="text-white font-mono">#{orderId?.slice(-6).toUpperCase()}</strong>.
                </p>

                <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                        <div className="bg-white/5 p-3 rounded-2xl">
                            <FiMail className="text-xl text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1">Entrega por E-mail</h3>
                            <p className="text-sm text-gray-500">As fotos selecionadas serão processadas e enviadas para o seu e-mail em até 24 horas.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="bg-white/5 p-3 rounded-2xl">
                            <FiHeart className="text-xl text-pink-400" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1">Suas Memórias Guardadas</h3>
                            <p className="text-sm text-gray-500">Agradecemos a confiança no trabalho de Thiago Battista. Esperamos que ame as fotos!</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link
                    href="/loja"
                    className="bg-white text-black font-bold py-4 px-8 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                    <FiShoppingCart />
                    VOLTAR PARA A LOJA
                </Link>
                <Link
                    href="/"
                    className="bg-white/5 border border-white/10 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/10 transition-all"
                >
                    IR PARA O PORTFÓLIO
                </Link>
            </div>
        </div>
    );
}

export default function SucessoPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Header />
            <Suspense fallback={<div className="pt-40 text-center">Carregando...</div>}>
                <SucessoContent />
            </Suspense>
        </main>
    );
}
