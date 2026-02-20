import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ADMIN_NAME = "Thiago Battista";

/**
 * The route param [id] is the short Cloudinary segment (last path part),
 * e.g. "xwqjeg7pbdildthphkap". The Image table stores the full public_id
 * like "webfolio/albumname/xwqjeg7pbdildthphkap".
 * This helper resolves the real DB id.
 */
async function resolveImageId(shortId: string): Promise<string | null> {
    // If it already looks like a full path, use it directly
    if (shortId.includes('/')) return shortId;

    // Look for an image whose id ends with /shortId
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
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        const comments = await prisma.comment.findMany({
            where: {
                imageId,
                parentId: null,
            },
            include: {
                replies: {
                    include: {
                        replies: true,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Strip authorToken before returning to client
        const strip = (c: any) => {
            const { authorToken, ...rest } = c;
            return {
                ...rest,
                replies: rest.replies?.map(strip) ?? [],
            };
        };

        return NextResponse.json(comments.map(strip));
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: rawId } = await params;
        const body = await request.json();
        const { content, parentId, authorName, authorToken, isAdmin } = body;

        if (!content) {
            return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
        }

        // Resolve the full image ID from the short segment
        const imageId = await resolveImageId(rawId);
        if (!imageId) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        // Auto-detect admin by name
        const resolvedIsAdmin = isAdmin || (authorName?.trim() === ADMIN_NAME);

        const newComment = await prisma.comment.create({
            data: {
                content,
                imageId,
                parentId,
                authorName: authorName || "Visitante",
                authorToken: authorToken || null,
                isAdmin: resolvedIsAdmin,
            },
        });

        const { authorToken: _, ...safeComment } = newComment as any;
        return NextResponse.json(safeComment);
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { commentId, authorToken, adminPassword } = body;

        if (!commentId) {
            return NextResponse.json({ error: "commentId is required" }, { status: 400 });
        }

        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        const isAdmin = adminPassword && adminPassword === process.env.ADMIN_PASSWORD;
        const isOwner = authorToken && comment.authorToken === authorToken;

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await prisma.comment.delete({ where: { id: commentId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { commentId, content, authorToken } = body;

        if (!commentId || !content?.trim()) {
            return NextResponse.json({ error: "commentId and content are required" }, { status: 400 });
        }

        const comment = await prisma.comment.findUnique({ where: { id: commentId } });
        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        if (!authorToken || comment.authorToken !== authorToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const updated = await prisma.comment.update({
            where: { id: commentId },
            data: { content: content.trim() },
        });

        const { authorToken: _, ...safe } = updated as any;
        return NextResponse.json(safe);
    } catch (error) {
        console.error("Error editing comment:", error);
        return NextResponse.json({ error: "Failed to edit comment" }, { status: 500 });
    }
}
