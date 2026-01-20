import { uploadImage } from '@/lib/cloudinary';
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
    const files = formData.getAll('files') as File[];

    if (!albumName || !categoria || files.length === 0) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    // 1. Lidar com a Categoria
    const categoriaNome = (formData.get('categoria') as string || '').trim();
    if (!categoriaNome) {
      return NextResponse.json({ error: 'Categoria é obrigatória.' }, { status: 400 });
    }

    const slug = categoriaNome.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-'); // Remove hífens duplicados

    // Busca por nome exato ou pelo slug gerado para evitar duplicatas
    let categoryObj = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: categoriaNome, mode: 'insensitive' } },
          { slug: slug }
        ]
      }
    });

    if (!categoryObj) {
      categoryObj = await prisma.category.create({
        data: {
          name: categoriaNome,
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
        categoria: categoryObj.name, // Usamos o nome oficial do objeto encontrado/criado
        subcategoria: albumName,
        tags: tags,
        categoryId: categoryObj.id,
        isPrivate: isPrivate,
        isForSale: isPrivate, // Se for privado, forçamos venda (conforme regra de negócio)
        accessPassword: isPrivate ? accessPassword : null,
        basePrice,
        basePhotoLimit,
        extraPhotoPrice,
        published: true
      }
    });

    // 3. Upload das Imagens
    const uploadedImages = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadImage(file, `webfolio/${albumId}`);

      const image = await prisma.image.create({
        data: {
          id: result.public_id,
          filename: file.name,
          path: result.secure_url,
          albumId: album.id,
          ordem: i,
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

    // Definir coverImage se houver imagens
    if (uploadedImages.length > 0) {
      await prisma.album.update({
        where: { id: album.id },
        data: { coverImage: uploadedImages[0].path }
      });
    }

    return NextResponse.json({ success: true, albumId: album.id, count: uploadedImages.length });

  } catch (error: any) {
    console.error('Erro no upload do álbum:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor.' }, { status: 500 });
  }
}