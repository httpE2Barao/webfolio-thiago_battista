import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const albumName = formData.get('albumName') as string;
        const description = formData.get('description') as string;
        const categoria = formData.get('categoria') as string;
        const isPrivate = formData.get('isPrivate') === 'true';
        const accessPassword = formData.get('accessPassword') as string;
        const basePrice = parseFloat(formData.get('basePrice') as string || '200');
        const basePhotoLimit = parseInt(formData.get('basePhotoLimit') as string || '10');
        const extraPhotoPrice = parseFloat(formData.get('extraPhotoPrice') as string || '50');
        const tags = formData.getAll('tags') as string[];

        if (!albumName || !categoria) {
            return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
        }

        // 1. Lidar com a Categoria
        let categoryObj = await prisma.category.findUnique({
            where: { name: categoria }
        });

        if (!categoryObj) {
            let slug = categoria.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            
            // Verificar se o slug já existe para evitar erro de restrição única
            const existingSlug = await prisma.category.findUnique({
                where: { slug: slug }
            });

            if (existingSlug) {
                // Se o slug existe mas o nome é diferente, adicionamos um sufixo aleatório
                slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
            }

            categoryObj = await prisma.category.create({
                data: {
                    name: categoria,
                    slug: slug
                }
            });
        }

        // 2. Criar o Álbum
        const albumId = albumName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now();

        const album = await prisma.album.create({
            data: {
                id: albumId,
                titulo: albumName,
                descricao: description,
                categoria: categoria,
                subcategoria: albumName,
                tags: tags,
                categoryId: categoryObj.id,
                isPrivate: isPrivate,
                isForSale: isPrivate, // Se for privado, forçamos venda
                accessPassword: isPrivate ? accessPassword : null,
                basePrice,
                basePhotoLimit,
                extraPhotoPrice,
                published: true
            }
        });

        return NextResponse.json({ success: true, albumId: album.id });

    } catch (error: any) {
        console.error('Erro ao criar álbum:', error);
        return NextResponse.json({ error: error.message || 'Erro interno no servidor.' }, { status: 500 });
    }
}
