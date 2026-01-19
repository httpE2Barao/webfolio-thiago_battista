import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    const password = request.nextUrl.searchParams.get('password');

    try {
        const album = await prisma.album.findUnique({
            where: { id },
            include: {
                Image: {
                    orderBy: { ordem: 'asc' },
                },
            },
        });

        if (!album || !album.isForSale) {
            return NextResponse.json({ error: 'Álbum não encontrado ou não disponível para venda' }, { status: 404 });
        }

        // Verificar se é privado e se a senha está correta
        if (album.isPrivate && album.accessPassword !== password) {
            return NextResponse.json({
                error: 'Senha incorreta ou requerida',
                isPrivate: true
            }, { status: 403 });
        }

        return NextResponse.json(album);
    } catch (error) {
        console.error('Erro ao buscar detalhes do álbum:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
