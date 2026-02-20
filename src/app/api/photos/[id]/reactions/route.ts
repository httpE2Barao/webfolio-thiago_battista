import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Resolves the full Image.id from the short Cloudinary segment.
 * Image.id is the full public_id (e.g. "webfolio/album/xyzabc"),
 * but the route param [id] is only the last segment (e.g. "xyzabc").
 */
async function resolveImageId(shortId: string): Promise<string | null> {
    if (shortId.includes('/')) return shortId;
    const image = await prisma.image.findFirst({
        where: { id: { endsWith: `/${shortId}` } },
        select: { id: true },
    });
    return image?.id ?? null;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params;
        const imageId = await resolveImageId(rawId);

        if (!imageId) {
            return NextResponse.json({});
        }

        const reactions = await prisma.reaction.groupBy({
            by: ["type"],
            where: { imageId },
            _count: {
                type: true,
            },
        });

        // Format the response to be more user-friendly
        const formattedReactions = reactions.reduce((acc: Record<string, number>, curr: { type: string; _count: { type: number } }) => {
            acc[curr.type] = curr._count.type;
            return acc;
        }, {} as Record<string, number>);

        return NextResponse.json(formattedReactions);
    } catch (error) {
        console.error("Error fetching reactions:", error);
        return NextResponse.json({ error: "Failed to fetch reactions" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params;
        const body = await request.json();
        const { type, userId } = body;

        if (!type) {
            return NextResponse.json({ error: "Reaction type is required" }, { status: 400 });
        }

        const imageId = await resolveImageId(rawId);
        if (!imageId) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        // If userId is provided, handle toggle logic
        if (userId) {
            const existingReaction = await prisma.reaction.findFirst({
                where: { imageId, userId },
            });

            if (existingReaction) {
                if (existingReaction.type === type) {
                    // Remove if clicking same type
                    await prisma.reaction.delete({
                        where: { id: existingReaction.id },
                    });
                    return NextResponse.json({ message: "Reaction removed" });
                } else {
                    // Update if clicking different type
                    const updated = await prisma.reaction.update({
                        where: { id: existingReaction.id },
                        data: { type },
                    });
                    return NextResponse.json(updated);
                }
            }
        }

        const newReaction = await prisma.reaction.create({
            data: { type, imageId, userId },
        });

        return NextResponse.json(newReaction);
    } catch (error) {
        console.error("Error creating reaction:", error);
        return NextResponse.json({ error: "Failed to create reaction" }, { status: 500 });
    }
}
