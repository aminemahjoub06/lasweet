// Client-only image compression via the Canvas API.
// Downscales to a max dimension and re-encodes as JPEG at ~80% quality.
// Runs entirely in the browser — never imported by server code.

const MAX_DIMENSION = 1200;
const QUALITY = 0.8;

export async function compressImage(file: File): Promise<File> {
  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;
  // HEIC/HEIF the browser can't decode — send as-is; server will validate.
  if (file.type === "image/heic" || file.type === "image/heif") return file;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Image decode failed"));
    el.src = dataUrl;
  });

  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width >= height) {
      height = Math.round((height * MAX_DIMENSION) / width);
      width = MAX_DIMENSION;
    } else {
      width = Math.round((width * MAX_DIMENSION) / height);
      height = MAX_DIMENSION;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.(png|webp|heic|heif|jpg|jpeg)$/i, ".jpg"), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
