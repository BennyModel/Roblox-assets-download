import type { ResolvedAsset } from "../types";

export function AssetInfo({ asset }: { asset: ResolvedAsset }) {
  return (
    <section className="panel">
      <p className="eyebrow">Asset Information</p>
      <dl className="info-grid">
        <div>
          <dt>Name</dt>
          <dd>{asset.name}</dd>
        </div>
        <div>
          <dt>Asset ID</dt>
          <dd>{asset.id}</dd>
        </div>
        <div>
          <dt>Creator</dt>
          <dd>{asset.creator?.name ?? "Unknown"}</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>{asset.assetType}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{asset.warnings.length ? "Limited" : "Ready"}</dd>
        </div>
      </dl>
      {asset.warnings.map((warning) => (
        <p className="warning" key={warning}>
          {warning}
        </p>
      ))}
    </section>
  );
}
