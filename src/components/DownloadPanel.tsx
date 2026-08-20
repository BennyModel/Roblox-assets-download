import type { DownloadFormatSelection, ModelDownloadFormat, TextureDownloadFormat } from "../types";

interface Props {
  formats: DownloadFormatSelection;
  selectedCount: number;
  onFormatsChange: (formats: DownloadFormatSelection) => void;
  onSelectPreset: (preset: "all" | "models" | "textures") => void;
  onDownload: () => void;
}

export function DownloadPanel({ formats, selectedCount, onFormatsChange, onSelectPreset, onDownload }: Props) {
  return (
    <section className="panel download-panel">
      <p className="eyebrow">Download Options</p>
      <div className="format-row">
        <label>
          <span>Model format</span>
          <select
            value={formats.model}
            onChange={(event) =>
              onFormatsChange({ ...formats, model: event.target.value as ModelDownloadFormat })
            }
          >
            <option value="obj">OBJ</option>
            <option value="fbx">FBX</option>
            <option value="rbxm">RBXM</option>
          </select>
        </label>
        <label>
          <span>Texture format</span>
          <select
            value={formats.texture}
            onChange={(event) =>
              onFormatsChange({ ...formats, texture: event.target.value as TextureDownloadFormat })
            }
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
        </label>
      </div>
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
