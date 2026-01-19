import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
    try {
        const { items } = await req.json(); // Array of { id: string, ordem: number }

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
        }

        // Usar transaction para garantir consistência
        await prisma.$transaction(
            items.map((item) =>
                prisma.image.update({
                    where: { id: item.id },
                    data: { ordem: item.ordem },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao reordenar fotos:', error);
        return NextResponse.json({ error: 'Erro ao reordenar fotos' }, { status: 500 });
    }
}
