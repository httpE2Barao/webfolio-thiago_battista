"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiInstagram, FiGlobe, FiBriefcase, FiAward, FiBookOpen, FiUser, FiDownload } from "react-icons/fi";

interface CVSection {
  id: string;
  title: string;
  content: string;
  category: string;
  sidebar: boolean;
  ordem: number;
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'experience': return <FiBriefcase className="text-red-500" />;
    case 'education': return <FiBookOpen className="text-red-500" />;
    case 'skills': return <FiAward className="text-red-500" />;
    case 'contact': return <FiGlobe className="text-red-500" />;
    default: return <FiUser className="text-red-500" />;
  }
};

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <strong className="text-white font-black">{children}</strong>
);

export default function SobrePage() {
  const [sections, setSections] = useState<CVSection[]>([]);
  const [cvUrl, setCvUrl] = useState("/Curriculo.pdf");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch CV sections
    const fetchCV = fetch("/api/admin/cv").then(res => res.json());
    // Fetch CV URL from Bio (where it's stored)
    const fetchBio = fetch("/api/admin/bio").then(res => res.json());

    Promise.all([fetchCV, fetchBio])
      .then(([cvData, bioData]) => {
        if (Array.isArray(cvData)) setSections(cvData);
        if (bioData?.cvUrl) setCvUrl(bioData.cvUrl);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setIsLoading(false);
      });
  }, []);

  const renderFormattedText = (text: string) => {
    return text.split("\n\n").map((para, i) => (
      <div key={i} className="mb-4">
        {para.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <Highlight key={j}>{part.slice(2, -2)}</Highlight>;
          }
          if (part.includes("@") || part.includes("https://") || part.includes(".com")) {
            return <span key={j} className="text-red-400 underline underline-offset-4 decoration-red-400/30">{part}</span>;
          }
          return part;
        })}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs uppercase tracking-[0.3em] text-gray-500"
        >
          Renderizando Experiência...
        </motion.div>
      </div>
    );
  }

  const summarySection = sections.find(s => s.category === 'summary');
  const skillsSection = sections.find(s => s.category === 'skills');
  const experienceSections = sections.filter(s => s.category === 'experience').sort((a, b) => a.ordem - b.ordem);
  const educationSections = sections.filter(s => s.category === 'education').sort((a, b) => a.ordem - b.ordem);
  const contactSections = sections.filter(s => s.category === 'contact');
  const noteSection = sections.find(s => s.title.toLowerCase().includes('nota'));

  return (
    <div className="min-h-screen bg-[#050505] text-[#d1d1d1] selection:bg-red-500/30 pb-32">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-16"
        >
          <div className="flex-1">
            <h1 className="text-7xl font-black uppercase tracking-tighter text-white leading-[0.8]">
              Thiago<br />Battista
            </h1>
            <p className="text-red-500 mt-6 font-mono text-sm uppercase tracking-[0.2em] font-bold">
              Fotógrafo & Gestor Cultural
            </p>
          </div>

          <div className="flex flex-col items-end gap-4">
            <a
              href={cvUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white rounded-2xl px-8 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 group shadow-2xl shadow-red-900/20 active:scale-95"
            >
              <FiDownload className="group-hover:translate-y-0.5 transition-transform" />
              Download PDF CV
            </a>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Left Column (Main Info) */}
          <div className="lg:col-span-8 space-y-24">
            {/* Summary */}
            {summarySection && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-red-500/70 border-b border-white/5 pb-4">Resumo Profissional</h2>
                <div className="text-xl font-medium leading-relaxed text-gray-300">
                  {summarySection.content}
                </div>
              </motion.section>
            )}

            {/* Experience */}
            <section className="space-y-12">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-red-500/70 border-b border-white/5 pb-4">Histórico de Trabalho</h2>
              <div className="space-y-20">
                {experienceSections.map((section, idx) => {
                  const parts = section.title.split('\n');
                  const cargo = parts[0];
                  const empresa = parts[1] || 'Experiência';

                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group"
                    >
                      <div className="font-mono text-xs text-red-500/80 mb-4 uppercase tracking-[0.2em] font-bold">
                        {cargo}
                      </div>
                      <h3 className="text-4xl font-black uppercase tracking-tighter text-white group-hover:text-red-500 transition-colors duration-500">
                        {empresa}
                      </h3>
                      <div className="mt-8 text-gray-400 font-mono text-sm leading-relaxed max-w-2xl">
                        {renderFormattedText(section.content)}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Note Section */}
            {noteSection && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/5"
              >
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-red-500/70 mb-8">{noteSection.title}</h2>
                <div className="text-gray-400 font-mono text-sm leading-relaxed uppercase">
                  {noteSection.content}
                </div>
              </motion.section>
            )}
          </div>

          {/* Right Column (Sidebar) */}
          <aside className="lg:col-span-4 space-y-20">
            {/* Contacts */}
            <section className="space-y-8">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-red-500/70 border-b border-white/5 pb-4">Contato</h2>
              <div className="space-y-6">
                {contactSections.map((s) => (
                  <div key={s.id} className="space-y-4">
                    {s.content.split('\n').map((line, i) => {
                      const isEmail = line.includes('@');
                      const isPhone = line.includes('(41)');
                      const isLink = line.includes('.app') || line.includes('instagram') || line.includes('http');

                      let href = '';
                      if (isEmail) href = `mailto:${line.split(': ')[1] || line}`;
                      if (isPhone) href = `tel:${(line.split(': ')[1] || line).replace(/\D/g, '')}`;
                      if (isLink) href = line.includes('http') ? line.split(': ')[1]?.trim() || line : `https://${line.split(': ')[1] || line}`;

                      return (
                        <div key={i} className="flex items-start gap-4">
                          <div className="pt-1 text-red-500/50">
                            {isEmail && <FiMail />}
                            {isPhone && <FiPhone />}
                            {isLink && <FiGlobe />}
                          </div>
                          <a
                            href={href || '#'}
                            target={isLink ? "_blank" : undefined}
                            className="text-sm font-mono text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-red-500/30 pb-1"
                          >
                            {line}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>

            {/* Skills */}
            {skillsSection && (
              <section className="space-y-8">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-red-500/70 border-b border-white/5 pb-4">Competências</h2>
                <ul className="space-y-3 font-mono text-xs text-gray-500">
                  {skillsSection.content.split('\n').map((skill, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-1 h-1 bg-red-500/30 rounded-full"></span>
                      {skill.replace('• ', '')}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Education */}
            <section className="space-y-8">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-red-500/70 border-b border-white/5 pb-4">Formação</h2>
              <div className="space-y-12">
                {educationSections.map((section, idx) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + (idx * 0.1) }}
                  >
                    <h4 className="text-xs font-black uppercase tracking-widest text-white mb-3">
                      {section.title}
                    </h4>
                    <div className="text-[10px] font-mono text-gray-500 leading-relaxed uppercase tracking-widest">
                      {renderFormattedText(section.content)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
