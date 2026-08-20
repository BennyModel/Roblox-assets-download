interface Props {
  selectedCount: number;
  onSelectPreset: (preset: "all" | "models" | "textures") => void;
  onDownload: () => void;
}

export function DownloadPanel({ selectedCount, onSelectPreset, onDownload }: Props) {
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
      <button className="primary-download" type="button" disabled={selectedCount === 0} onClick={onDownload}>
        Download Selected ({selectedCount})
      </button>
    </section>
  );
}
