import { robloxFetch } from "./http";

export interface CreatorStoreAsset {
  id: number;
  name: string;
  description?: string;
  assetType?: string;
  creator?: {
    id?: number;
    name?: string;
    type?: string;
  };
}

export async function getCreatorStoreAsset(assetId: number): Promise<CreatorStoreAsset | undefined> {
  try {
    return await robloxFetch<CreatorStoreAsset>(
      `https://apis.roblox.com/toolbox-service/v1/items/details?assetIds=${assetId}`,
    );
  } catch {
    return undefined;
  }
}
