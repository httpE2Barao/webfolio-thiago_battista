
/**
 * Compresses an image file if it is larger than a specified size limit (default 5MB).
 * Uses HTML Canvas for resizing and compression.
 * 
 * @param file The original File object.
 * @param maxSizeMB The maximum allowed size in MB (default 5).
 * @param maxWidthOrHeight The maximum width or height in pixels (default 3840 - 4K).
 * @returns A Promise that resolves to the compressed File or the original file if no compression was needed/possible.
 */
export async function compressImage(
    file: File,
    maxSizeMB: number = 5,
    maxWidthOrHeight: number = 3840
): Promise<File> {
    // 1. Check if compression is needed
    if (file.size <= maxSizeMB * 1024 * 1024) {
        return file;
    }

    try {
        // 2. Load image
        const imageBitmap = await createImageBitmap(file);

        // 3. Calculate new dimensions
        let { width, height } = imageBitmap;
        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
            if (width > height) {
                height = Math.round((height * maxWidthOrHeight) / width);
                width = maxWidthOrHeight;
            } else {
                width = Math.round((width * maxWidthOrHeight) / height);
                height = maxWidthOrHeight;
            }
        }

        // 4. Create Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return file;

        // 5. Draw image to canvas
        ctx.drawImage(imageBitmap, 0, 0, width, height);

        // 6. Compress recursively/iteratively
        let quality = 0.9;
        let compressedBlob: Blob | null = null;

        do {
            compressedBlob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, 'image/jpeg', quality)
            );

            if (!compressedBlob) break;

            // If satisfied or quality too low, break
            if (compressedBlob.size <= maxSizeMB * 1024 * 1024 || quality < 0.5) {
                break;
            }

            quality -= 0.1;
        } while (quality > 0.4);

        if (compressedBlob && compressedBlob.size < file.size) {
            return new File([compressedBlob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
            });
        }

        return file;

    } catch (error) {
        console.error("Error compressing image:", error);
        return file; // Return original on error
    }
}
