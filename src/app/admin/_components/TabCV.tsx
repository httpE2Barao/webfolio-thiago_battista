"use client";

import { useState, useEffect, useRef } from "react";
import { FiUpload, FiTrash2, FiSave, FiPlus, FiArrowUp, FiArrowDown, FiSearch, FiLoader } from "react-icons/fi";
import Tesseract from "tesseract.js";

// Helper for dynamic pdfjs loading
const getPdfJs = async () => {
    // @ts-ignore
    const pdfjs = await import("pdfjs-dist/build/pdf");
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    return pdfjs;
};

interface CVSection {
    id?: string;
    title: string;
    content: string;
    category: string;
    sidebar: boolean;
    ordem: number;
}

export function TabCV() {
    const [sections, setSections] = useState<CVSection[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);
    const [status, setStatus] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const res = await fetch("/api/admin/cv");
            const data = await res.json();
            if (Array.isArray(data)) setSections(data);
        } catch (error) {
            console.error("Error fetching sections:", error);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsExtracting(true);
        setStatus("Lendo PDF...");

        try {
            const pdfjs = await getPdfJs();
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                setStatus(`Processando página ${i} de ${pdf.numPages}...`);
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    // Fix: Adding canvas property to render parameters as required by types
                    await page.render({
                        canvasContext: context,
                        viewport: viewport,
                        canvas: canvas
                    } as any).promise;

                    const { data: { text } } = await Tesseract.recognize(canvas, "por");
                    fullText += text + "\n";
                }
            }

            setStatus("Organizando seções...");
            console.log("Extracted Text:", fullText);

            const extractedSections = splitTextIntoSections(fullText);

            if (extractedSections.length === 0 && fullText.trim().length > 0) {
                // Fallback: If no keywords found, put everything in one section
                extractedSections.push({
                    title: "Conteúdo Extraído",
                    content: fullText,
                    category: "general",
                    sidebar: false,
                    ordem: sections.length
                });
            }

            setSections(prev => [...prev, ...extractedSections]);
            setStatus("Extração concluída!");
        } catch (error) {
            console.error("OCR Error:", error);
            setStatus("Erro na extração.");
        } finally {
            setIsExtracting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const splitTextIntoSections = (text: string): CVSection[] => {
        // This is a basic splitter. In a real scenario, we might want to detect keywords.
        const lines = text.split("\n").filter(l => l.trim().length > 0);
        const result: CVSection[] = [];
        let currentSection: CVSection | null = null;

        const keywords = ["experiência", "formação", "competências", "contato", "sobre", "perfil", "atuação", "principais"];

        lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            const isHeader = keywords.some(k => lowerLine.includes(k)) && line.length < 50;

            if (isHeader) {
                if (currentSection) result.push(currentSection);
                currentSection = {
                    title: line.trim(),
                    content: "",
                    category: "general",
                    sidebar: false,
                    ordem: result.length
                };
            } else if (currentSection) {
                currentSection.content += line + "\n";
            }
        });

        if (currentSection) result.push(currentSection);
        return result;
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            // Save each section. In a real scenario, we might want a bulk API endpoint.
            // Our POST endpoint already supports bulk update (reorder), but let's 
            // ensure it handles new sections too if we send them in an array.

            // For simplicity, let's just trigger individual saves for now or improve the API.
            // The API I wrote: if (Array.isArray(data)) { /* reorder */ } else { /* single */ }
            // Let's modify the API to handle bulk save/update.

            const res = await fetch("/api/admin/cv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sections)
            });

            if (res.ok) {
                setStatus("Todas as seções salvas!");
                fetchSections();
            }
        } catch (error) {
            console.error("Save all error:", error);
            setStatus("Erro ao salvar todas.");
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatus(""), 3000);
        }
    };

    const handleSave = async (section: CVSection) => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/cv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(section)
            });
            if (res.ok) {
                const saved = await res.json();
                setSections(sections.map(s => s.id === section.id || (!s.id && s.title === section.title) ? saved : s));
            }
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id?: string) => {
        if (!id) {
            setSections(sections.filter(s => s.id !== undefined));
            return;
        }

        if (confirm("Tem certeza que deseja excluir esta seção?")) {
            try {
                await fetch(`/api/admin/cv?id=${id}`, { method: "DELETE" });
                setSections(sections.filter(s => s.id !== id));
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };

    const addManualSection = () => {
        setSections([...sections, { title: "Nova Seção", content: "", category: "general", sidebar: false, ordem: sections.length }]);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10">
                <div>
                    <h2 className="text-xl font-bold text-white mb-2">Currículo Estruturado (OCR)</h2>
                    <p className="text-gray-400 text-sm">Extraia texto do PDF ou adicione seções manualmente para o layout web.</p>
                </div>
                <div className="flex gap-4">
                    <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isExtracting}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all"
                    >
                        {isExtracting ? <FiLoader className="animate-spin" /> : <FiSearch />}
                        {isExtracting ? "Extraindo..." : "Extrair do PDF"}
                    </button>
                    <button
                        onClick={handleSaveAll}
                        disabled={isSaving || sections.length === 0}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-all"
                    >
                        {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
                        Salvar Todas
                    </button>
                    <button
                        onClick={addManualSection}
                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-xl flex items-center gap-2 border border-white/10 transition-all"
                    >
                        <FiPlus /> Adicionar Seção
                    </button>
                </div>
            </div>

            {status && (
                <div className="text-xs font-mono text-blue-400 uppercase tracking-widest animate-pulse">
                    {status}
                </div>
            )}

            <div className="grid gap-6">
                {sections.map((section, index) => (
                    <div key={index} className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => {
                                            const newSections = [...sections];
                                            newSections[index].title = e.target.value;
                                            setSections(newSections);
                                        }}
                                        className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white w-full font-bold"
                                        placeholder="Título da Seção (ex: Experiência)"
                                    />
                                    <select
                                        value={section.category}
                                        onChange={(e) => {
                                            const newSections = [...sections];
                                            newSections[index].category = e.target.value;
                                            setSections(newSections);
                                        }}
                                        className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white"
                                    >
                                        <option value="general">Geral</option>
                                        <option value="experience">Experiência</option>
                                        <option value="education">Formação</option>
                                        <option value="skills">Habilidades</option>
                                        <option value="contact">Contato</option>
                                    </select>
                                    <label className="flex items-center gap-2 text-gray-400 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={section.sidebar}
                                            onChange={(e) => {
                                                const newSections = [...sections];
                                                newSections[index].sidebar = e.target.checked;
                                                setSections(newSections);
                                            }}
                                        /> Barra Lateral?
                                    </label>
                                </div>
                                <textarea
                                    value={section.content}
                                    onChange={(e) => {
                                        const newSections = [...sections];
                                        newSections[index].content = e.target.value;
                                        setSections(newSections);
                                    }}
                                    rows={5}
                                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white w-full text-sm font-mono focus:ring-1 focus:ring-blue-500/50"
                                    placeholder="Conteúdo da seção..."
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleSave(section)}
                                    className="p-3 bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white rounded-xl transition-all"
                                    title="Salvar"
                                >
                                    <FiSave />
                                </button>
                                <button
                                    onClick={() => handleDelete(section.id)}
                                    className="p-3 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all"
                                    title="Excluir"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
