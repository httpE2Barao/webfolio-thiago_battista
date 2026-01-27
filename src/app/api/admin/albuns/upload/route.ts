import { uploadImage } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const albumId = formData.get('albumId') as string;
        const file = formData.get('file') as File;
        // Opcional: ordem passada pelo cliente, senão pegamos o count atual
        const orderParam = formData.get('order');

        if (!albumId || !file) {
            return NextResponse.json({ error: 'AlbumId e arquivo são obrigatórios.' }, { status: 400 });
        }

        // Verificar se álbum existe
        const album = await prisma.album.findUnique({
            where: { id: albumId },
            include: { _count: { select: { Image: true } } }
        });

        if (!album) {
            return NextResponse.json({ error: 'Álbum não encontrado.' }, { status: 404 });
        }

        const currentCount = album._count.Image;
        const order = orderParam ? parseInt(orderParam as string) : currentCount;

        // Upload para Cloudinary
        const result = await uploadImage(file, `webfolio/${albumId}`);

        // Criar Image no banco
        const image = await prisma.image.create({
            data: {
                id: result.public_id,
                filename: file.name,
                path: result.secure_url,
                albumId: album.id,
                ordem: order,
                metadata: {
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    bytes: result.bytes
                }
            }
        });

        // Se for a primeira imagem ou o álbum não tiver capa, definir como capa
        if (!album.coverImage) {
            await prisma.album.update({
                where: { id: album.id },
                data: { coverImage: result.secure_url }
            });
        }

        return NextResponse.json({ success: true, imageId: image.id });

    } catch (error: any) {
        console.error('Erro no upload de imagem:', error);
        // Retornar detalhes do erro se for do Cloudinary
        const errorMessage = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        return NextResponse.json({
            error: 'Erro no servidor durante o upload.',
            details: errorMessage
        }, { status: 500 });
    }
}
