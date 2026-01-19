import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const albuns = await prisma.album.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                _count: {
                    select: { Image: true }
                }
            }
        });
        return NextResponse.json(albuns);
    } catch (error) {
        console.error('Erro ao buscar álbuns admin:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
