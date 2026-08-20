import type { ResolvedAsset } from "../types";

export function AssetPreview({ asset }: { asset: ResolvedAsset }) {
  return (
    <section className="panel preview-panel">
      <div>
        <p className="eyebrow">Preview</p>
        <h2>{asset.name}</h2>
      </div>
      {asset.thumbnail ? (
        <img src={asset.thumbnail} alt={`${asset.name} thumbnail`} />
      ) : (
        <div className="empty-preview">No thumbnail</div>
      )}
    </section>
  );
}
