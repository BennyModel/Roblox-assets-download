import { robloxFetch } from "./http";

export interface CatalogItemDetails {
  id: number;
  itemType: "Asset" | "Bundle";
  assetType?: number;
  assetTypeDisplayName?: string;
  name: string;
  description?: string;
  creatorName?: string;
  creatorTargetId?: number;
  creatorType?: string;
  productId?: number;
  itemStatus?: string[];
}

interface CatalogDetailsResponse {
  data: CatalogItemDetails[];
}

export async function getCatalogAssetDetails(assetIds: number[]): Promise<CatalogItemDetails[]> {
  const items = assetIds.map((id) => ({ itemType: "Asset", id }));
  const response = await robloxFetch<CatalogDetailsResponse>(
    "https://catalog.roblox.com/v1/catalog/items/details",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items }),
    },
  );

  return response.data ?? [];
}

export function displayCatalogType(item?: CatalogItemDetails): string {
  return item?.assetTypeDisplayName || (item?.assetType ? `Asset type ${item.assetType}` : "Asset");
}
