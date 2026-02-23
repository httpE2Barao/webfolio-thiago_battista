import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const sections = await prisma.cVSection.findMany({
            orderBy: { ordem: 'asc' }
        });
        return NextResponse.json(sections);
    } catch (error) {
        console.error("Error fetching CV sections:", error);
        return NextResponse.json({ error: "Erro ao buscar seções do CV" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Data can be a single section or an array of sections (for bulk upsert/reorder)
        if (Array.isArray(data)) {
            // Bulk upsert
            const updates = data.map((section: any, idx: number) => {
                const sectionData = {
                    title: section.title,
                    content: section.content,
                    category: section.category || 'general',
                    sidebar: section.sidebar || false,
                    ordem: section.ordem !== undefined ? section.ordem : idx
                };

                if (section.id) {
                    return prisma.cVSection.update({
                        where: { id: section.id },
                        data: sectionData
                    });
                } else {
                    return prisma.cVSection.create({
                        data: sectionData
                    });
                }
            });
            await prisma.$transaction(updates);
            return NextResponse.json({ message: "Seções processadas com sucesso" });
        } else {
            // Single section create/update
            const { id, title, content, category, sidebar, ordem } = data;

            if (id) {
                const section = await prisma.cVSection.update({
                    where: { id },
                    data: { title, content, category, sidebar, ordem }
                });
                return NextResponse.json(section);
            } else {
                const section = await prisma.cVSection.create({
                    data: { title, content, category, sidebar, ordem: ordem || 0 }
                });
                return NextResponse.json(section);
            }
        }
    } catch (error) {
        console.error("Error saving CV section:", error);
        return NextResponse.json({ error: "Erro ao salvar seção do CV" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
        }

        await prisma.cVSection.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Seção excluída com sucesso" });
    } catch (error) {
        console.error("Error deleting CV section:", error);
        return NextResponse.json({ error: "Erro ao excluir seção do CV" }, { status: 500 });
    }
}
