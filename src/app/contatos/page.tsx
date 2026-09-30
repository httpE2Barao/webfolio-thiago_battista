"use client";

import TituloResponsivo from "@/components/TituloResponsivo";
import {
  FiInstagram,
  FiMail,
  FiPhone,
  FiDownload,
} from "react-icons/fi";

export default function ContatosPage() {
  return (
    <div className="flex flex-col min-h-[60vh] items-center justify-center py-20 px-4">
      <TituloResponsivo className="mb-12">Vamos conversar?</TituloResponsivo>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 w-full max-w-5xl">
        <a
          href="mailto:studio.thiagobattista@gmail.com"
          className="group bg-white/5 border border-white/10 p-10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-white/30 transition-all"
        >
          <div className="p-3 md:p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
            <FiMail size={28} className="md:w-8 md:h-8" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">
            E-mail
          </span>
          <span className="text-base md:text-lg font-bold truncate w-full text-center">
            studio.thiagobattista@gmail.com
          </span>
        </a>

        <a
          href="https://wa.me/5541997985847"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white/5 border border-white/10 p-10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-white/30 transition-all"
        >
          <div className="p-3 md:p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
            <FiPhone size={28} className="md:w-8 md:h-8" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">
            WhatsApp
          </span>
          <span className="text-lg font-bold">+55 (41) 99798-5847</span>
        </a>

        <a
          href="https://instagram.com/thiago_battista_"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white/5 border border-white/10 p-10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-white/30 transition-all"
        >
          <div className="p-3 md:p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
            <FiInstagram size={28} className="md:w-8 md:h-8" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">
            Instagram
          </span>
          <span className="text-lg font-bold">@thiago_battista_</span>
        </a>

        <a
          href="/CV-thiago-battista.pdf"
          download=""
          className="group bg-white/5 border border-white/10 p-10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-white/30 transition-all"
        >
          <div className="p-3 md:p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
            <FiDownload size={28} className="md:w-8 md:h-8" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">
            Currículo
          </span>
          <span className="text-lg font-bold">Baixar PDF</span>
        </a>
      </div>

      <p className="mt-20 text-gray-600 text-[10px] uppercase font-black tracking-[0.2em] text-center">
        Baseado no Paraná, Brasil • Disponível para projetos globais
      </p>
    </div>
  );
}