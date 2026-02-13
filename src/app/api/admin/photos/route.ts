import { deleteImage } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    try {
        // 1. Buscar a imagem para pegar o ID do Cloudinary (que é o próprio ID aqui)
        const image = await prisma.image.findUnique({
            where: { id },
        });

        if (!image) {
            return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 });
        }

        // 2. Deletar do Cloudinary
        await deleteImage(image.id);

        // 3. Deletar do Banco
        await prisma.image.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erro ao deletar foto:', error);
        return NextResponse.json({ error: 'Erro ao deletar foto' }, { status: 500 });
    }
}
