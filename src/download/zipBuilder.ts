import JSZip from "jszip";
import type { DownloadableAsset, DownloadFormatSelection, ResolvedAsset } from "../types";
import { sanitizeFileName } from "./downloadFile";
import { prepareDownload } from "./formatExporter";

export async function buildZip(
  resolved: ResolvedAsset,
  selected: DownloadableAsset[],
  formats: DownloadFormatSelection,
): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder(sanitizeFileName(resolved.name))!;
  const modelFolder = root.folder("model")!;
  const textureFolder = root.folder("textures")!;

  for (const asset of selected) {
    if (!asset.blob) continue;
    const target = asset.role === "texture" || asset.role.endsWith("Map") ? textureFolder : modelFolder;
    const prepared = await prepareDownload(asset, formats);
    target.file(prepared.filename, prepared.blob);
  }

  return zip.generateAsync({ type: "blob" });
}
