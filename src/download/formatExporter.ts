import type { DownloadableAsset, DownloadFormatSelection, ModelDownloadFormat, TextureDownloadFormat } from "../types";
import { sanitizeFileName } from "./downloadFile";

export interface PreparedDownload {
  blob: Blob;
  filename: string;
}

export async function prepareDownload(asset: DownloadableAsset, formats: DownloadFormatSelection): Promise<PreparedDownload> {
  if (!asset.blob) throw new Error(`${asset.name ?? asset.assetId} has no source file.`);

  const texture = isTexture(asset);
  const format = texture ? formats.texture : formats.model;
  const blob = texture
    ? await prepareTexture(asset.blob, format as TextureDownloadFormat)
    : await prepareModel(asset.blob, asset.extension, format as ModelDownloadFormat);

  return {
    blob,
    filename: `${sanitizeFileName(asset.name || `${asset.role}-${asset.assetId}`)}-${asset.assetId}.${format}`,
  };
}

function isTexture(asset: DownloadableAsset): boolean {
  return asset.role === "texture" || asset.role.endsWith("Map") || asset.role === "thumbnail";
}

async function prepareTexture(source: Blob, format: TextureDownloadFormat): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create image converter.");

  context.drawImage(bitmap, 0, 0);
  bitmap.close();

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Texture conversion failed."))),
      format === "png" ? "image/png" : "image/jpeg",
      0.95,
    );
  });
}

async function prepareModel(source: Blob, sourceExtension: string | undefined, format: ModelDownloadFormat): Promise<Blob> {
  if (sourceExtension === "json") throw new Error("Roblox returned JSON instead of a model file.");
  if (format === "rbxm") {
    if (sourceExtension !== "rbxm") throw new Error("This source is not an RBXM model.");
    return source;
  }

  const text = await source.text();
  const obj = sourceExtension === "obj" ? text : robloxMeshTextToObj(text);

  if (format === "obj") {
    return new Blob([obj], { type: "model/obj" });
  }

  return new Blob([objToAsciiFbx(obj)], { type: "model/fbx" });
}

function robloxMeshTextToObj(text: string): string {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!/^version\s+\d/i.test(lines[0] ?? "")) {
    throw new Error("This Roblox mesh is binary and cannot be exported in the browser.");
  }

  const vertices: string[] = [];
  const uvs: string[] = [];
  const normals: string[] = [];
  const faces: string[] = [];
  let mode: "vertices" | "faces" = "vertices";

  for (const line of lines.slice(1)) {
    const values = line.split(/\s+/).map(Number);
    if (values.some((value) => Number.isNaN(value))) continue;

    if (values.length === 1) continue;
    if (values.length >= 8 && mode === "vertices") {
      vertices.push(`v ${values[0]} ${values[1]} ${values[2]}`);
      normals.push(`vn ${values[3]} ${values[4]} ${values[5]}`);
      uvs.push(`vt ${values[6]} ${1 - values[7]}`);
      continue;
    }

    if (values.length >= 3) {
      mode = "faces";
      const indices = values.slice(0, 3).map((value) => Math.trunc(value) + 1);
      faces.push(`f ${indices.map((index) => `${index}/${index}/${index}`).join(" ")}`);
    }
  }

  if (vertices.length === 0 || faces.length === 0) {
    throw new Error("This Roblox mesh format is not exportable in the browser.");
  }

  return ["# Exported by Roblox Asset Downloader", ...vertices, ...uvs, ...normals, ...faces, ""].join("\n");
}

function objToAsciiFbx(obj: string): string {
  const vertices: number[][] = [];
  const faces: number[][] = [];

  for (const line of obj.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/);
    if (parts[0] === "v" && parts.length >= 4) {
      vertices.push(parts.slice(1, 4).map(Number));
    }
    if (parts[0] === "f" && parts.length >= 4) {
      faces.push(parts.slice(1).map((part) => Number(part.split("/")[0]) - 1).filter((value) => value >= 0));
    }
  }

  const vertexData = vertices.flat().join(",");
  const polygonData = faces.flatMap((face) => face.map((index, faceIndex) => (faceIndex === face.length - 1 ? -index - 1 : index))).join(",");

  return [
    "; FBX 7.4.0 project file",
    "FBXHeaderExtension:  { FBXHeaderVersion: 1003 FBXVersion: 7400 }",
    "Objects:  {",
    '  Geometry: 1, "Geometry::Model", "Mesh" {',
    `    Vertices: *${vertices.length * 3} { a: ${vertexData} }`,
    `    PolygonVertexIndex: *${faces.reduce((count, face) => count + face.length, 0)} { a: ${polygonData} }`,
    "  }",
    "}",
    "",
  ].join("\n");
}
