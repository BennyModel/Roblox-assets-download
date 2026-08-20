import type { DownloadableAsset } from "../../types";
import { RobloxApiError } from "../../types";
import { detectFileType } from "../../assets/fileType";
import { robloxBlob, robloxFetch } from "./http";

interface AssetDeliveryLocation {
  location?: string;
  Location?: string;
}

interface BatchAssetDeliveryItem {
  assetId: number;
  locations?: AssetDeliveryLocation[];
  errors?: { code?: number; message?: string }[];
}

export async function getAssetDeliveryLocation(assetId: number): Promise<string | undefined> {
  const legacyUrl = `https://assetdelivery.roblox.com/v1/assetId/${assetId}`;

  try {
    const payload = await robloxFetch<AssetDeliveryLocation | BatchAssetDeliveryItem>(legacyUrl);
    const direct = "location" in payload ? payload.location || payload.Location : undefined;
    const batchLike = "locations" in payload ? payload.locations?.[0]?.location : undefined;
    return direct || batchLike;
  } catch (error) {
    if (error instanceof RobloxApiError && error.code === "CORS_BLOCKED") {
      return legacyUrl;
    }
    throw error;
  }
}

export async function fetchOriginalAsset(
  assetId: number,
  role: DownloadableAsset["role"],
  name?: string,
): Promise<DownloadableAsset> {
  try {
    const location = (await getAssetDeliveryLocation(assetId)) ?? `https://assetdelivery.roblox.com/v1/assetId/${assetId}`;
    const response = await robloxBlob(location);
    const blob = await response.blob();
    const signature = await blob.slice(0, 64).arrayBuffer();
    const detected = detectFileType(new Uint8Array(signature), response.headers.get("content-type"), role);

    if (detected.extension === "json") {
      return {
        assetId,
        name,
        role,
        mimeType: detected.mimeType,
        extension: detected.extension,
        downloadUrl: response.url,
        available: false,
        status: "Roblox returned JSON instead of an asset source file.",
        source: "Asset Delivery",
        byteLength: blob.size,
      };
    }

    return {
      assetId,
      name,
      role,
      mimeType: detected.mimeType,
      extension: detected.extension,
      downloadUrl: response.url,
      available: true,
      status: "Ready",
      source: "Asset Delivery",
      byteLength: blob.size,
      blob,
    };
  } catch (error) {
    return {
      assetId,
      name,
      role,
      available: false,
      status: error instanceof Error ? error.message : "Download blocked by Roblox.",
      source: "Asset Delivery",
    };
  }
}
