
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // 1. Fetch available albums
        const albums = await prisma.album.findMany({
            select: { tags: true }
        });

        const allTags = new Set<string>();

        // 2. Extract unique tags
        albums.forEach((album: any) => {
            if (album.tags && Array.isArray(album.tags)) {
                album.tags.forEach((tag: any) => {
                    if (typeof tag === 'string') allTags.add(tag);
                });
            }
        });

        // 3. Upsert into Tag table
        const operations = Array.from(allTags).map(tagName => {
            return prisma.tag.upsert({
                where: { name: tagName },
                update: {}, // do nothing if exists
                create: { name: tagName }
            });
        });

        await prisma.$transaction(operations);

        return NextResponse.json({ success: true, count: operations.length });
    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json({ error: "Migration failed" }, { status: 500 });
    }
}
