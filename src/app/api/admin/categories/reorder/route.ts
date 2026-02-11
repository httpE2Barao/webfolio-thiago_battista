import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
    try {
        const { categories } = await req.json();

        if (!Array.isArray(categories)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const updates = categories.map((cat: { id: string, ordem: number }) =>
            (prisma.category as any).update({
                where: { id: cat.id },
                data: { ordem: cat.ordem }
            })
        );

        await prisma.$transaction(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error reordering categories:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
