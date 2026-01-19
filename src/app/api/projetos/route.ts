import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      where: {
        published: true
      },
      include: {
        Category: true,
        Image: {
          orderBy: {
            ordem: 'asc'
          }
        }
      },
      orderBy: {
        ordem: 'asc'
      }
    })

    // Transform the data to match the existing structure
    const transformedAlbums = albums.reduce((acc: Record<string, unknown>, album) => {
      // Use the album title as the key (like the original structure)
      const albumKey = album.titulo;
      acc[albumKey] = {
        titulo: album.titulo,
        descricao: album.descricao || `${album.categoria} ${album.titulo}`,
        categoria: album.categoria,
        subcategoria: album.subcategoria,
        coverImageMobile: album.coverImageMobile,
        coverImageDesktop: album.coverImageDesktop,
        imagens: album.Image.map(image => ({
          id: `${albumKey}-${image.id}`, // Create composite ID
          imagem: image.path
        } as unknown))
      }
      return acc
    }, {})

    return NextResponse.json(transformedAlbums)
  } catch (error) {
    console.error('Error fetching albums:', error)
    return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 })
  }
}