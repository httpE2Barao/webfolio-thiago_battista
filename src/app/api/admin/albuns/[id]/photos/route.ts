import { uploadImage } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id: albumId } = params;

    try {
        const formData = await req.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
        }

        // Buscar última ordem para adicionar ao final
        const lastImage = await prisma.image.findFirst({
            where: { albumId },
            orderBy: { ordem: 'desc' },
        });
        let initialOrder = (lastImage?.ordem ?? -1) + 1;

        const uploadedImages = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const result = await uploadImage(file, `webfolio/${albumId}`);

            const image = await prisma.image.create({
                data: {
                    id: result.public_id,
                    filename: file.name,
                    path: result.secure_url,
                    albumId: albumId,
                    ordem: initialOrder + i,
                    metadata: {
                        width: result.width,
                        height: result.height,
                        format: result.format,
                        bytes: result.bytes
                    }
                }
            });
            uploadedImages.push(image);
        }

        return NextResponse.json({ success: true, count: uploadedImages.length, images: uploadedImages });
    } catch (error: any) {
        console.error('Erro ao adicionar fotos:', error);
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
    }
}
