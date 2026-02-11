import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { albumId, coverImagePath, type, position } = await request.json();

        if (!albumId || !coverImagePath) {
            return NextResponse.json(
                { error: 'albumId and coverImagePath are required' },
                { status: 400 }
            );
        }

        // Determine which field to update
        const data: any = {
            updatedAt: new Date()
        };

        if (type === 'desktop') {
            data.coverImageDesktop = coverImagePath;
            data.coverImage = coverImagePath; // Also update main cover for compatibility
            if (position) data.coverImageDesktopPosition = position;
        } else if (type === 'mobile') {
            data.coverImageMobile = coverImagePath;
            if (position) data.coverImageMobilePosition = position;
        } else {
            // Default behavior if type is not specified
            data.coverImage = coverImagePath;
        }

        // Update the album with the new cover image
        const updatedAlbum = await prisma.album.update({
            where: { id: albumId },
            data,
        });

        return NextResponse.json({
            success: true,
            album: updatedAlbum
        });
    } catch (error) {
        console.error('Error setting album cover:', error);
        return NextResponse.json(
            { error: 'Failed to set album cover' },
            { status: 500 }
        );
    }
}

// GET endpoint to fetch albums with their images for cover selection
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const albumId = searchParams.get('albumId');

        if (albumId) {
            // Get specific album with all images
            const album = await prisma.album.findUnique({
                where: { id: albumId },
                include: {
                    Image: {
                        orderBy: { ordem: 'asc' }
                    }
                }
            });

            if (!album) {
                return NextResponse.json(
                    { error: 'Album not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ album });
        }

        // Get all albums with cover info
        const albums = await prisma.album.findMany({
            include: {
                Image: {
                    orderBy: { ordem: 'asc' },
                    take: 5 // Just first 5 images for preview
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ albums });
    } catch (error) {
        console.error('Error fetching albums:', error);
        return NextResponse.json(
            { error: 'Failed to fetch albums' },
            { status: 500 }
        );
    }
}
