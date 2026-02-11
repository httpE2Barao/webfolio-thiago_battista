import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const albuns = await prisma.album.findMany({
            where: {
                isForSale: true,
                isPrivate: true,
                published: true,
            },
            select: {
                id: true,
                titulo: true,
                descricao: true,
                coverImage: true,
                coverImageMobile: true,
                coverImageDesktop: true,
                coverImageMobilePosition: true,
                coverImageDesktopPosition: true,
                isPrivate: true,
                basePrice: true,
                basePhotoLimit: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return NextResponse.json(albuns);
    } catch (error) {
        console.error('Erro ao buscar álbuns da loja:', error);
        return NextResponse.json({ error: 'Erro interno ao buscar álbuns' }, { status: 500 });
    }
}
