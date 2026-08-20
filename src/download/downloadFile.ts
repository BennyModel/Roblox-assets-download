import type { DownloadableAsset } from "../types";

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function buildFileName(asset: DownloadableAsset): string {
  const base = sanitizeFileName(asset.name || `${asset.role}-${asset.assetId}`);
  const extension = asset.extension ? `.${asset.extension}` : "";
  return `${base}-${asset.assetId}${extension}`;
}

export function sanitizeFileName(input: string): string {
  const cleaned = [...input]
    .map((char) => (char.charCodeAt(0) < 32 || '<>:"/\\|?*'.includes(char) ? "-" : char))
    .join("");
  return cleaned.replace(/\s+/g, " ").trim().slice(0, 90) || "asset";
}
