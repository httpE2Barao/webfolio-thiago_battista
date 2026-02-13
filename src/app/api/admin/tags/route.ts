import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const albums = await prisma.album.findMany({
            select: { tags: true }
        });

        // 1. Tags explicitamente cadastradas no modelo Tag (com ordem)
        // @ts-ignore - Prisma might not have regenerated yet
        const dbTagsModel = await prisma.tag.findMany({
            orderBy: { ordem: 'asc' }
        });

        // 2. Use the already fetched albums if possible, or just fetch tags
        const albumTags = new Set<string>();
        albums.forEach((album: { tags: any }) => {
            if (album.tags && Array.isArray(album.tags)) {
                album.tags.forEach((tag: any) => {
                    if (typeof tag === 'string') albumTags.add(tag);
                });
            }
        });

        // Retornamos os objetos do modelo Tag primeiro, e depois as outras tags encontradas nos álbuns
        // @ts-ignore
        const dbTagNames = dbTagsModel.map((t: any) => t.name.toLowerCase());
        const extraTags = Array.from(albumTags)
            .filter(t => !dbTagNames.includes(t.toLowerCase()))
            .map(t => ({ id: t, name: t, ordem: 999 })); // Ordem alta para tags não gerenciadas

        return NextResponse.json([...dbTagsModel, ...extraTags]);
    } catch (error) {
        console.error('Erro ao buscar tags:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });

        const tag = await prisma.tag.create({
            data: {
                name,
                ordem: 99
            }
        });

        return NextResponse.json(tag);
    } catch (error: any) {
        console.error('Erro ao criar tag:', error);
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
    }
}
