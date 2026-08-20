import type { RelatedAsset } from "../types";

export function BundleContents({ items }: { items: RelatedAsset[] }) {
  if (items.length === 0) return null;

  return (
    <section className="panel">
      <p className="eyebrow">Related Assets</p>
      <div className="related-grid">
        {items.map((item) => (
          <div className="related-item" key={`${item.relationship}:${item.assetId}`}>
            <strong>{item.assetId}</strong>
            <span>{item.relationship}</span>
            <small>{item.source}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
