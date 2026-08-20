import JSZip from "jszip";
import type { DownloadableAsset, ResolvedAsset } from "../types";
import { buildFileName, sanitizeFileName } from "./downloadFile";

export async function buildZip(
  resolved: ResolvedAsset,
  selected: DownloadableAsset[],
  includeMetadata: boolean,
): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder(sanitizeFileName(resolved.name))!;
  const modelFolder = root.folder("model")!;
  const textureFolder = root.folder("textures")!;
  const metadataFolder = root.folder("metadata")!;

  for (const asset of selected) {
    if (!asset.blob) continue;
    const target = asset.role === "texture" || asset.role.endsWith("Map") ? textureFolder : modelFolder;
    target.file(buildFileName(asset), asset.blob);
  }

  if (includeMetadata) {
    metadataFolder.file(
      "asset.json",
      JSON.stringify(
        {
          ...resolved.metadata,
          downloadedAt: new Date().toISOString(),
          files: selected.map(({ blob: _blob, ...asset }) => asset),
        },
        null,
        2,
      ),
    );
  }

  return zip.generateAsync({ type: "blob" });
}
