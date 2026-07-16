/* File helpers — read as data URL, downscale images, format size. */

export const MAX_IMAGE_WIDTH = 1600;
export const IMAGE_JPEG_QUALITY = 0.82;

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function isImageFile(file) {
  return file?.type?.startsWith('image/');
}

export function isPdfFile(file) {
  return file?.type === 'application/pdf';
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/** Downscale an image File to fit within MAX_IMAGE_WIDTH, return JPEG dataURL. */
export async function processImage(file, maxWidth = MAX_IMAGE_WIDTH) {
  const dataUrl = await readAsDataUrl(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      try {
        const out = canvas.toDataURL('image/jpeg', IMAGE_JPEG_QUALITY);
        resolve(out);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/** Process a doc (PDF or other) — just data URL + metadata. */
export async function processDocument(file) {
  const dataUrl = await readAsDataUrl(file);
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    dataUrl,
  };
}

/** Process an image — downscale, return { name, size, type, dataUrl }. */
export async function processImageFile(file, maxWidth) {
  const dataUrl = await processImage(file, maxWidth);
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    dataUrl,
  };
}

/** Extract the asset ID prefix from a filename. Matches "AST-2026-0901" or "AST·2026·0901".
 *  Returns the canonical form with · separators (matching the store's listing IDs). */
export function extractAssetId(filename) {
  const m = filename.match(/^(AST)[··\-_\s]?(\d{4})[··\-_\s]?(\d{3,4})/i);
  if (!m) return null;
  return `${m[1].toUpperCase()}·2026·${m[3]}`;
}
