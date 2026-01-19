import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const albums = await prisma.album.findMany({
            select: { tags: true }
        });

        const allTags = new Set<string>();
        albums.forEach(album => {
            if (album.tags && Array.isArray(album.tags)) {
                album.tags.forEach((tag: any) => {
                    if (typeof tag === 'string') {
                        allTags.add(tag);
                    }
                });
            }
        });

        return NextResponse.json(Array.from(allTags).sort());
    } catch (error) {
        console.error('Erro ao buscar tags:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
