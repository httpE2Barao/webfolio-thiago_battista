import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                Album: {
                    select: { titulo: true }
                }
            }
        });
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
