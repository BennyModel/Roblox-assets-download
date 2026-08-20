export interface ParsedAssetReference {
  assetId: number;
  relationship: string;
}

const RELATIONSHIP_HINTS: Array<[RegExp, string]> = [
  [/mesh/i, "Mesh"],
  [/texture/i, "Texture"],
  [/colormap|color map/i, "ColorMap"],
  [/normal/i, "NormalMap"],
  [/roughness/i, "RoughnessMap"],
  [/metalness|metallic/i, "MetalnessMap"],
  [/emissive/i, "EmissiveMap"],
  [/cage/i, "Cage"],
];

export async function extractAssetReferences(blob: Blob): Promise<ParsedAssetReference[]> {
  const buffer = await blob.arrayBuffer();
  const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  const references = new Map<number, ParsedAssetReference>();
  const patterns = [
    /rbxassetid:\/\/(\d+)/gi,
    /https?:\/\/www\.roblox\.com\/asset\/\?id=(\d+)/gi,
    /https?:\/\/assetdelivery\.roblox\.com\/v1\/asset(?:Id)?\/?(\d+)/gi,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text))) {
      const assetId = Number(match[1]);
      if (!Number.isFinite(assetId)) continue;
      const context = text.slice(Math.max(0, match.index - 80), Math.min(text.length, match.index + 120));
      references.set(assetId, {
        assetId,
        relationship: inferRelationship(context),
      });
    }
  }

  return [...references.values()];
}

function inferRelationship(context: string): string {
  for (const [pattern, label] of RELATIONSHIP_HINTS) {
    if (pattern.test(context)) return label;
  }
  return "Referenced Asset";
}
