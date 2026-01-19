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

    // If not a Cloudinary URL, return as-is
    if (!url.includes('cloudinary.com')) return url;

    // Cloudinary transformation: width, quality, auto format
    let transformation = `w_${width},q_${quality},f_auto`;

    // Add watermark if requested
    if (withWatermark) {
        // Text watermark: center, 30% opacity, "Thiago Battista"
        transformation += ',l_text:Inter_60_bold:THIAGO%20BATTISTA,o_20,g_center,co_rgb:FFFFFF';
    }

    // Handle URLs that already have transformations
    if (url.includes('/upload/')) {
        return url.replace('/upload/', `/upload/${transformation}/`);
    }

    return url;
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
