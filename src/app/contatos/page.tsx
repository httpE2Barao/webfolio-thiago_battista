"use client";

import TituloResponsivo from "@/components/TituloResponsivo";
import { FiInstagram, FiMail, FiPhone } from "react-icons/fi";

export default function ContatosPage() {
  return (
    <div className="flex flex-col min-h-[60vh] items-center justify-center py-20 px-4">
      <TituloResponsivo className="mb-12">Vamos conversar?</TituloResponsivo>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
        <a
          href="mailto:contato@thiagobattista.com"
          className="group bg-white/5 border border-white/10 p-10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-white/30 transition-all"
        >
          <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
            <FiMail size={32} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">E-mail</span>
          <span className="text-lg font-bold truncate w-full text-center">contato@thiagobattista.com</span>
        </a>

        <a
          href="https://instagram.com/thiagobattista"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white/5 border border-white/10 p-10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-white/30 transition-all"
        >
          <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
            <FiInstagram size={32} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Instagram</span>
          <span className="text-lg font-bold">@thiagobattista</span>
        </a>

        <a
          href="tel:+5511999999999"
          className="group bg-white/5 border border-white/10 p-10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-white/30 transition-all"
        >
          <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
            <FiPhone size={32} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">WhatsApp</span>
          <span className="text-lg font-bold">+55 (41) 99888-7766</span>
        </a>
      </div>

      <p className="mt-20 text-gray-600 text-[10px] uppercase font-black tracking-[0.2em] text-center">
        Based in Curitiba, Brazil • Disponível para projetos globais
      </p>
    </div>
  );
}
