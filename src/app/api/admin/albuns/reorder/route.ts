import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { items } = await req.json();

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Lista de itens inválida' }, { status: 400 });
        }

        // Atualização em lote usando transação para garantir atomicidade
        await prisma.$transaction(
            items.map((item: { id: string, ordem: number }) =>
                prisma.album.update({
                    where: { id: item.id },
                    data: { ordem: item.ordem }
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao reordenar álbuns:', error);
        return NextResponse.json({ error: 'Erro interno ao reordenar' }, { status: 500 });
    }
}
