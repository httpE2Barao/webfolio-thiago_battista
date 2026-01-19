/**
 * Optimizes Cloudinary URLs with automatic format, quality, and width transformations.
 * Falls back to original URL if not a Cloudinary URL.
 */
export function optimizeCloudinaryUrl(
    url: string | undefined | null,
    width: number,
    quality = 75,
    withWatermark = false
): string {
    if (!url) return '/placeholder.jpg';

    let finalUrl = url;

    // FAIL-SAFE: If it's a legacy local path, convert to Cloudinary URL
    if (url.startsWith('/images/')) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dx9whz8ee';
        if (!cloudName) {
            console.error('CLOUDINARY_CLOUD_NAME is not defined');
            return url;
        }
        // Format: /images/Album Name/photo.jpg -> albums/Album Name/photo
        // Remove leading /images/ and extension
        const pathWithoutPrefix = url.replace('/images/', '');
        const pathParts = pathWithoutPrefix.split('/');

        if (pathParts.length >= 2) {
            const folder = pathParts[0];
            const fileNameWithExt = pathParts[1];
            const fileName = fileNameWithExt.split('.')[0];

            // Reconstruct as Cloudinary URL using the 'albums' folder
            finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/albums/${encodeURIComponent(folder)}/${encodeURIComponent(fileName)}`;
        }
    }

    // If not a Cloudinary URL after conversion, return as-is
    if (!finalUrl.includes('cloudinary.com')) return finalUrl;

    // Cloudinary transformation: width, quality, auto format
    let transformation = `w_${width},q_${quality},f_auto`;

    // Add watermark if requested
    if (withWatermark) {
        transformation += ',l_text:Inter_60_bold:THIAGO%20BATTISTA,o_20,g_center,co_rgb:FFFFFF';
    }

    // Handle URLs that already have transformations or base URLs
    if (finalUrl.includes('/upload/')) {
        return finalUrl.replace('/upload/', `/upload/${transformation}/`);
    }

    return finalUrl;
}

/**
 * Get optimized URL for thumbnail/card display (smaller)
 */
export function getThumbUrl(url: string | undefined | null, withWatermark = false): string {
    return optimizeCloudinaryUrl(url, 640, 60, withWatermark);
}

/**
 * Get optimized URL for swiper/carousel display (medium)
 */
export function getSwiperUrl(url: string | undefined | null, withWatermark = false): string {
    return optimizeCloudinaryUrl(url, 1200, 75, withWatermark);
}

/**
 * Get high-quality URL for fullscreen/modal display
 */
export function getFullscreenUrl(url: string | undefined | null, withWatermark = false): string {
    return optimizeCloudinaryUrl(url, 1920, 90, withWatermark);
}

/**
 * Get original quality URL (for zoom)
 */
export function getOriginalUrl(url: string | undefined | null): string {
    if (!url) return '/placeholder.jpg';
    return url;
}
