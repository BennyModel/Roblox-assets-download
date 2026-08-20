export type DownloadRole =
  | "model"
  | "mesh"
  | "texture"
  | "colorMap"
  | "normalMap"
  | "roughnessMap"
  | "metalnessMap"
  | "emissiveMap"
  | "thumbnail"
  | "metadata"
  | "other";

export interface Creator {
  id?: number;
  name: string;
  type?: string;
}

export interface DownloadableAsset {
  assetId: number;
  name?: string;
  role: DownloadRole;
  mimeType?: string;
  extension?: string;
  downloadUrl?: string;
  available: boolean;
  status?: string;
  source?: string;
  relationship?: string;
  byteLength?: number;
  blob?: Blob;
  thumbnail?: string;
}

export interface RelatedAsset {
  assetId: number;
  type: string;
  source: string;
  relationship: string;
  available: boolean;
  sourceFormat?: string;
}

export interface GraphNode {
  assetId: number;
  label: string;
  type: string;
  relationship: string;
  children: GraphNode[];
}

export interface ResolvedAsset {
  id: number;
  name: string;
  assetType: string;
  creator?: Creator;
  thumbnail?: string;
  sourceURL?: string;
  bundleId?: number;
  models: DownloadableAsset[];
  textures: DownloadableAsset[];
  relatedAssets: RelatedAsset[];
  graph: GraphNode;
  metadata: Record<string, unknown>;
  warnings: string[];
}

export interface BundleItem {
  id: number;
  name: string;
  type: string;
  thumbnail?: string;
  selected: boolean;
}

export interface ResolveProgress {
  label: string;
}

export type ResolverMode = "asset" | "bundle" | "avatar";

export type ModelDownloadFormat = "obj" | "fbx" | "rbxm";
export type TextureDownloadFormat = "png" | "jpeg";

export interface DownloadFormatSelection {
  model: ModelDownloadFormat;
  texture: TextureDownloadFormat;
}

export class RobloxApiError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code = "ROBLOX_API_ERROR", status?: number) {
    super(message);
    this.name = "RobloxApiError";
    this.code = code;
    this.status = status;
  }
}
