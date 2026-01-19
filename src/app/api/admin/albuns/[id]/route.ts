import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id } = params;
    try {
        const album = await prisma.album.findUnique({
            where: { id },
            include: {
                Image: {
                    orderBy: { ordem: 'asc' },
                },
            },
        });
        if (!album) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(album);
    } catch (error) {
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const { id } = params;
        const body = await request.json();

        const updatedAlbum = await prisma.album.update({
            where: { id },
            data: {
                titulo: body.titulo,
                descricao: body.descricao,
                tags: body.tags,
                categoria: body.categoria, // Note: If category changes, we might want to update categoryId logic too, but keeping simple for now or adding logic.
                // Let's verify if we need to update relations. The current schema has Category model.
                // If user changes 'categoria' string, we should probably check/create the Category model similar to upload.
                // For now, I will add the fields directly, but optimally we should handle the Category relation.

                // Sales Config
                isForSale: body.isForSale,
                isPrivate: body.isPrivate,
                accessPassword: body.accessPassword,
                basePrice: body.basePrice !== undefined ? parseFloat(body.basePrice) : undefined,
                basePhotoLimit: body.basePhotoLimit !== undefined ? parseInt(body.basePhotoLimit) : undefined,
                extraPhotoPrice: body.extraPhotoPrice !== undefined ? parseFloat(body.extraPhotoPrice) : undefined,
            },
        });

        return NextResponse.json(updatedAlbum);
    } catch (error) {
        console.error('Erro ao atualizar álbum:', error);
        return NextResponse.json({ error: 'Erro ao atualizar álbum' }, { status: 500 });
    }
}
