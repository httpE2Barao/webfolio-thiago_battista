import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
