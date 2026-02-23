import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const bio = await prisma.bio.findFirst();
        return NextResponse.json(bio);
    } catch (error) {
        console.error("Error fetching bio:", error);
        return NextResponse.json({ error: "Erro ao buscar sobre mim" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { content, cvUrl } = await req.json();

        const existingBio = await prisma.bio.findFirst();

        if (existingBio) {
            const updatedBio = await prisma.bio.update({
                where: { id: existingBio.id },
                data: { content, cvUrl },
            });
            return NextResponse.json(updatedBio);
        } else {
            const newBio = await prisma.bio.create({
                data: { content, cvUrl },
            });
            return NextResponse.json(newBio);
        }
    } catch (error) {
        console.error("Error updating bio:", error);
        return NextResponse.json({ error: "Erro ao atualizar sobre mim" }, { status: 500 });
    }
}
