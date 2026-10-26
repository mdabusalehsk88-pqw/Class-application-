/**
 * Ultra-fast client-side image compression & optimization utility.
 * Prevents mobile memory pressure, avoids GPU canvas crashes / black screens,
 * and ensures image payloads stay small (~25KB-50KB) to fit comfortably within
 * localStorage quotas and Firestore's 1MB document limit.
 */
export async function compressAndResizeImage(
  file: File | Blob,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      // Clean up object URL memory
      URL.revokeObjectURL(objectUrl);

      try {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio constrained dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          return reject(new Error('Could not initialize canvas graphics context.'));
        }

        // Fill white background in case of transparent PNG/WebP converted to JPEG
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // High quality downsampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as lightweight optimized JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image file.'));
    };

    img.src = objectUrl;
  });
}
