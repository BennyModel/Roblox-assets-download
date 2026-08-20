import type { DownloadableAsset, RelatedAsset, ResolveProgress, ResolvedAsset } from "../types";
import { fetchOriginalAsset } from "../api/roblox/assetDelivery";
import { getCatalogAssetDetails, displayCatalogType } from "../api/roblox/catalog";
import { getBundleDetails } from "../api/roblox/bundles";
import { getAssetThumbnails } from "../api/roblox/thumbnails";
import { getUserAvatar } from "../api/roblox/avatar";
import { resolveUser } from "../api/roblox/users";
import { extractNumericId } from "./input";
import { extractAssetReferences } from "./rbxmParser";
import { buildGraph, uniqueRelatedAssets } from "./relationshipGraph";

const MAX_DEPTH = 1;
const DOWNLOAD_CONCURRENCY = 2;

export async function resolveAsset(
  input: string,
  onProgress?: (progress: ResolveProgress) => void,
): Promise<ResolvedAsset> {
  const id = extractNumericId(input);
  if (!id) throw new Error("Invalid Asset ID");

  onProgress?.({ label: "Reading asset..." });
  const [details] = await getCatalogAssetDetails([id]);
  const thumbnails = await getAssetThumbnails([id]);
  const name = details?.name ?? `Asset ${id}`;
  const assetType = displayCatalogType(details);

  onProgress?.({ label: "Checking available files..." });
  const original = await fetchOriginalAsset(id, classifyPrimaryRole(assetType), name);
  const related: RelatedAsset[] = [];
  const models: DownloadableAsset[] = [original];
  const textures: DownloadableAsset[] = [];
  const visited = new Set<number>([id]);

  if (original.available && original.blob) {
    onProgress?.({ label: "Finding related meshes..." });
    const refs = await extractAssetReferences(original.blob);
    for (const ref of refs) {
      if (visited.has(ref.assetId)) continue;
      visited.add(ref.assetId);
      related.push({
        assetId: ref.assetId,
        type: inferTypeFromRelationship(ref.relationship),
        source: "RBXM reference scan",
        relationship: ref.relationship,
        available: true,
      });
    }
  }

  onProgress?.({ label: "Finding textures..." });
  const relatedDownloads = await resolveRelatedDownloads(uniqueRelatedAssets(related), MAX_DEPTH);
  for (const item of relatedDownloads) {
    if (isTextureRole(item.role)) textures.push(item);
    else models.push(item);
  }

  onProgress?.({ label: "Ready" });
  const unique = uniqueRelatedAssets(related);
  return {
    id,
    name,
    assetType,
    creator: details?.creatorName
      ? { id: details.creatorTargetId, name: details.creatorName, type: details.creatorType }
      : undefined,
    thumbnail: thumbnails.get(id),
    sourceURL: normalizeSourceURL(input, id),
    models,
    textures,
    relatedAssets: unique,
    graph: buildGraph(id, "Main Asset", unique),
    metadata: {
      assetId: id,
      name,
      creator: details?.creatorName,
      assetType,
      sourceURL: normalizeSourceURL(input, id),
      relatedAssetIds: unique.map((item) => item.assetId),
      meshAssetIds: unique.filter((item) => item.type === "mesh").map((item) => item.assetId),
      textureAssetIds: unique.filter((item) => item.type === "texture").map((item) => item.assetId),
    },
    warnings: original.available
      ? []
      : [
          original.status ??
            "Original source is unavailable anonymously. Metadata and thumbnails may still be public.",
        ],
  };
}

export async function resolveBundle(input: string, onProgress?: (progress: ResolveProgress) => void): Promise<ResolvedAsset> {
  const bundleId = extractNumericId(input);
  if (!bundleId) throw new Error("Invalid Bundle ID");

  onProgress?.({ label: "Reading asset..." });
  const bundle = await getBundleDetails(bundleId);
  const assetItems = bundle.items.filter((item) => item.type.toLowerCase() === "asset");
  const assetIds = assetItems.map((item) => item.id);
  const thumbnails = await getAssetThumbnails(assetIds);

  const related = assetItems.map<RelatedAsset>((item) => ({
    assetId: item.id,
    type: item.type,
    source: "Bundle API",
    relationship: "Bundle Item",
    available: true,
  }));

  onProgress?.({ label: "Checking available files..." });
  const downloads = await mapWithConcurrency(
    assetItems,
    DOWNLOAD_CONCURRENCY,
    (item) => fetchOriginalAsset(item.id, classifyPrimaryRole(item.name), item.name),
  );

  onProgress?.({ label: "Ready" });
  return {
    id: bundleId,
    bundleId,
    name: bundle.name,
    assetType: bundle.bundleType ?? "Bundle",
    creator: bundle.creator,
    thumbnail: thumbnails.get(assetIds[0]),
    models: downloads.filter((item) => !isTextureRole(item.role)),
    textures: downloads.filter((item) => isTextureRole(item.role)),
    relatedAssets: related,
    graph: buildGraph(bundleId, "Bundle", related),
    metadata: {
      bundleId,
      name: bundle.name,
      creator: bundle.creator,
      relatedAssetIds: assetIds,
      meshAssetIds: [],
      textureAssetIds: [],
    },
    warnings: downloads.some((item) => !item.available)
      ? ["Some bundle files are not downloadable anonymously from Asset Delivery."]
      : [],
  };
}

export async function resolveAvatar(input: string, onProgress?: (progress: ResolveProgress) => void): Promise<ResolvedAsset> {
  onProgress?.({ label: "Reading asset..." });
  const user = await resolveUser(input);
  const userId = user.id;
  const avatar = await getUserAvatar(userId);
  const assetIds = avatar.assets.map((asset) => asset.id);

  onProgress?.({ label: "Checking available files..." });
  const downloads = await mapWithConcurrency(
    avatar.assets,
    DOWNLOAD_CONCURRENCY,
    (asset) => fetchOriginalAsset(asset.id, classifyPrimaryRole(asset.assetType?.name ?? asset.name), asset.name),
  );

  const related = avatar.assets.map<RelatedAsset>((asset) => ({
    assetId: asset.id,
    type: asset.assetType?.name ?? "Avatar Asset",
    source: "Avatar API",
    relationship: "Currently Wearing",
    available: true,
  }));

  onProgress?.({ label: "Ready" });
  return {
    id: userId,
    name: user.name,
    assetType: avatar.playerAvatarType ?? "Avatar",
    thumbnail: `https://www.roblox.com/avatar-thumbnail/image?userId=${userId}&width=420&height=420&format=png`,
    models: downloads.filter((item) => !isTextureRole(item.role)),
    textures: downloads.filter((item) => isTextureRole(item.role)),
    relatedAssets: related,
    graph: buildGraph(userId, "Avatar", related),
    metadata: {
      userId,
      username: user.name,
      displayName: user.displayName,
      assetType: avatar.playerAvatarType,
      relatedAssetIds: assetIds,
      meshAssetIds: [],
      textureAssetIds: [],
    },
    warnings: downloads.some((item) => !item.available)
      ? ["Some avatar assets are private, moderated, or blocked from anonymous browser download."]
      : [],
  };
}

async function resolveRelatedDownloads(related: RelatedAsset[], depth: number): Promise<DownloadableAsset[]> {
  if (depth < 0 || related.length === 0) return [];
  return mapWithConcurrency(
    related,
    DOWNLOAD_CONCURRENCY,
    (item) =>
      fetchOriginalAsset(
        item.assetId,
        item.type === "texture" ? relationshipToTextureRole(item.relationship) : "mesh",
        `${item.relationship} ${item.assetId}`,
      ),
  );
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, run));
  return results;
}

function classifyPrimaryRole(assetType: string): DownloadableAsset["role"] {
  return /shirt|pants|t-shirt|texture|image|decal/i.test(assetType) ? "texture" : "model";
}

function inferTypeFromRelationship(relationship: string): string {
  return /texture|map|emissive|roughness|normal|metal/i.test(relationship) ? "texture" : "mesh";
}

function relationshipToTextureRole(relationship: string): DownloadableAsset["role"] {
  if (/color/i.test(relationship)) return "colorMap";
  if (/normal/i.test(relationship)) return "normalMap";
  if (/roughness/i.test(relationship)) return "roughnessMap";
  if (/metal/i.test(relationship)) return "metalnessMap";
  if (/emissive/i.test(relationship)) return "emissiveMap";
  return "texture";
}

function isTextureRole(role: DownloadableAsset["role"]): boolean {
  return role === "texture" || role.endsWith("Map") || role === "thumbnail";
}

function normalizeSourceURL(input: string, id: number): string {
  return /^https?:\/\//i.test(input.trim()) ? input.trim() : `https://www.roblox.com/catalog/${id}`;
}
