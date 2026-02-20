import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const updatedComment = await prisma.comment.update({
            where: { id },
            data: {
                likes: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json(updatedComment);
    } catch (error) {
        console.error("Error liking comment:", error);
        return NextResponse.json({ error: "Failed to like comment" }, { status: 500 });
    }
}
