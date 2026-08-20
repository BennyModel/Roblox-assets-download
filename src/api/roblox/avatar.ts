import { robloxFetch } from "./http";

export interface AvatarAsset {
  id: number;
  name: string;
  assetType?: {
    id: number;
    name: string;
  };
}

export interface AvatarAppearance {
  scales?: Record<string, number>;
  playerAvatarType?: string;
  assets: AvatarAsset[];
}

export async function getUserAvatar(userId: number): Promise<AvatarAppearance> {
  return robloxFetch<AvatarAppearance>(`https://avatar.roblox.com/v1/users/${userId}/avatar`);
}

export async function getCurrentlyWearing(userId: number): Promise<number[]> {
  const response = await robloxFetch<{ assetIds: number[] }>(
    `https://avatar.roblox.com/v1/users/${userId}/currently-wearing`,
  );
  return response.assetIds ?? [];
}
