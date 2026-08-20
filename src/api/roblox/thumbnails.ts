import { robloxFetch } from "./http";

interface ThumbnailResponse {
  data: Array<{
    targetId: number;
    state: string;
    imageUrl?: string;
  }>;
}

export async function getAssetThumbnails(assetIds: number[], size = "420x420"): Promise<Map<number, string>> {
  if (assetIds.length === 0) return new Map();
  const params = new URLSearchParams({
    assetIds: assetIds.join(","),
    size,
    format: "Png",
    isCircular: "false",
    returnPolicy: "PlaceHolder",
  });

  const response = await robloxFetch<ThumbnailResponse>(`https://thumbnails.roblox.com/v1/assets?${params}`);
  return new Map(response.data.filter((item) => item.imageUrl).map((item) => [item.targetId, item.imageUrl as string]));
}

export async function getAvatarThumbnails(userIds: number[], size = "720x720"): Promise<Map<number, string>> {
  if (userIds.length === 0) return new Map();
  const params = new URLSearchParams({
    userIds: userIds.join(","),
    size,
    format: "Png",
    isCircular: "false",
  });

  const response = await robloxFetch<ThumbnailResponse>(`https://thumbnails.roblox.com/v1/users/avatar?${params}`);
  return new Map(response.data.filter((item) => item.imageUrl).map((item) => [item.targetId, item.imageUrl as string]));
}
