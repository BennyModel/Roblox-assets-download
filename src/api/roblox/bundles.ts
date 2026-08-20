import { robloxFetch } from "./http";

export interface RobloxBundleItem {
  id: number;
  name: string;
  type: string;
}

export interface RobloxBundle {
  id: number;
  name: string;
  description?: string;
  bundleType?: string;
  creator?: {
    id?: number;
    name: string;
    type?: string;
  };
  items: RobloxBundleItem[];
}

export async function getBundleDetails(bundleId: number): Promise<RobloxBundle> {
  return robloxFetch<RobloxBundle>(`https://catalog.roblox.com/v1/bundles/${bundleId}/details`);
}
