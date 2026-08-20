interface Props {
  includeMetadata: boolean;
  selectedCount: number;
  onIncludeMetadata: (value: boolean) => void;
  onSelectPreset: (preset: "all" | "models" | "textures") => void;
  onDownload: () => void;
}

export function DownloadPanel({ includeMetadata, selectedCount, onIncludeMetadata, onSelectPreset, onDownload }: Props) {
  return (
    <section className="panel download-panel">
      <p className="eyebrow">Download Options</p>
      <div className="preset-row">
        <button type="button" onClick={() => onSelectPreset("all")}>
          Model + Textures
        </button>
        <button type="button" onClick={() => onSelectPreset("models")}>
          Model Only
        </button>
        <button type="button" onClick={() => onSelectPreset("textures")}>
          Textures Only
        </button>
      </div>
      <label className="metadata-toggle">
        <input type="checkbox" checked={includeMetadata} onChange={(event) => onIncludeMetadata(event.target.checked)} />
        Include metadata JSON
      </label>
      <button className="primary-download" type="button" disabled={selectedCount === 0} onClick={onDownload}>
        Download Selected ({selectedCount})
      </button>
    </section>
  );
}
