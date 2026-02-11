import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id: albumId } = params;

    try {
        const photos = await prisma.image.findMany({
            where: { albumId },
            orderBy: { ordem: 'asc' },
            select: {
                id: true,
                path: true,
                ordem: true
            }
        });

        return NextResponse.json(photos);
    } catch (error) {
        console.error('Erro ao buscar fotos admin:', error);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id: albumId } = params;

    try {
        const body = await req.json();
        const { images: imagesToSave } = body;

        if (!imagesToSave || !Array.isArray(imagesToSave)) {
            return NextResponse.json({ error: 'Nenhuma imagem fornecida.' }, { status: 400 });
        }

        // Buscar última ordem para adicionar ao final
        const lastImage = await prisma.image.findFirst({
            where: { albumId },
            orderBy: { ordem: 'desc' },
        });

        let currentOrder = (lastImage?.ordem ?? -1) + 1;
        const createdImages = [];

        for (const imgData of imagesToSave) {
            const image = await prisma.image.create({
                data: {
                    id: imgData.public_id,
                    filename: imgData.original_filename || 'image',
                    path: imgData.secure_url,
                    albumId: albumId,
                    ordem: currentOrder++,
                    metadata: {
                        width: imgData.width,
                        height: imgData.height,
                        format: imgData.format,
                        bytes: imgData.bytes,
                        resource_type: imgData.resource_type
                    }
                }
            });
            createdImages.push(image);
        }

        return NextResponse.json({
            success: true,
            count: createdImages.length,
            images: createdImages
        });
    } catch (error: any) {
        console.error('Erro ao salvar fotos no banco:', error);
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
    }
}
