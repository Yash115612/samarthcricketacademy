
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

export function validateImage(file: File): { ok: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: "Only JPG, PNG and WEBP images are allowed." };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, error: "Image size must be less than 2MB." };
  }
  return { ok: true };
}

export function sanitizeFileName(fileName: string): string {
  const ext = fileName.split(".").pop();
  const name = fileName
    .split(".")
    .slice(0, -1)
    .join(".")
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();
  return `${Date.now()}_${name}.${ext}`;
}
