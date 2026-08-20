import JSZip from "jszip";
import type { DownloadableAsset, ResolvedAsset } from "../types";
import { buildFileName, sanitizeFileName } from "./downloadFile";

export async function buildZip(resolved: ResolvedAsset, selected: DownloadableAsset[]): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder(sanitizeFileName(resolved.name))!;
  const modelFolder = root.folder("model")!;
  const textureFolder = root.folder("textures")!;

  for (const asset of selected) {
    if (!asset.blob) continue;
    const target = asset.role === "texture" || asset.role.endsWith("Map") ? textureFolder : modelFolder;
    target.file(buildFileName(asset), asset.blob);
  }

  return zip.generateAsync({ type: "blob" });
}
