
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;

    try {
        await prisma.tag.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Erro ao excluir tag:', error);
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
    }
}
