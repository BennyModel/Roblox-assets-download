import type { GraphNode, RelatedAsset } from "../types";

export function buildGraph(rootId: number, rootLabel: string, related: RelatedAsset[]): GraphNode {
  const children = related.map((item) => ({
    assetId: item.assetId,
    label: `${item.relationship} ${item.assetId}`,
    type: item.type,
    relationship: item.relationship,
    children: [],
  }));

  return {
    assetId: rootId,
    label: rootLabel,
    type: "Main Asset",
    relationship: "root",
    children,
  };
}

export function uniqueRelatedAssets(items: RelatedAsset[]): RelatedAsset[] {
  const seen = new Set<number>();
  return items.filter((item) => {
    if (seen.has(item.assetId)) return false;
    seen.add(item.assetId);
    return true;
  });
}
