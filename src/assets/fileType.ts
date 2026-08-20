import type { DownloadRole } from "../types";

export function detectFileType(
  bytes: Uint8Array,
  contentType: string | null,
  role: DownloadRole,
): { mimeType: string; extension: string } {
  const type = contentType?.split(";")[0].toLowerCase();

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { mimeType: "image/png", extension: "png" };
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }

  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes).trimStart();
  if (text.startsWith("<roblox")) return { mimeType: "application/xml", extension: "rbxm" };
  if (text.startsWith("#") || text.startsWith("v ") || text.includes("\nf ")) {
    return { mimeType: "model/obj", extension: "obj" };
  }

  if (type?.includes("png")) return { mimeType: "image/png", extension: "png" };
  if (type?.includes("jpeg") || type?.includes("jpg")) return { mimeType: "image/jpeg", extension: "jpg" };
  if (type?.includes("json")) return { mimeType: "application/json", extension: "json" };
  if (type?.includes("xml")) return { mimeType: "application/xml", extension: "rbxm" };
  if (type?.includes("octet-stream") && role === "mesh") return { mimeType: type, extension: "mesh" };
  if (role === "texture" || role.endsWith("Map")) return { mimeType: type || "application/octet-stream", extension: "bin" };

  return { mimeType: type || "application/octet-stream", extension: role === "model" ? "rbxm" : "bin" };
}
