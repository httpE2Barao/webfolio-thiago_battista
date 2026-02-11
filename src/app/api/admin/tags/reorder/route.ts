import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
    try {
        const { tags } = await req.json();

        if (!Array.isArray(tags)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // We use $transaction to ensure all updates succeed or fail together
        const updates = tags.map((tag: { name: string, ordem: number }) =>
            // @ts-ignore
            prisma.tag.upsert({
                where: { name: tag.name },
                update: { ordem: tag.ordem },
                create: { name: tag.name, ordem: tag.ordem }
            })
        );

        await prisma.$transaction(updates);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error reordering tags:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
