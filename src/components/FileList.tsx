import type { DownloadableAsset } from "../types";

interface Props {
  title: string;
  files: DownloadableAsset[];
  selectedIds: Set<string>;
  onToggle: (key: string) => void;
}

export function FileList({ title, files, selectedIds, onToggle }: Props) {
  return (
    <section className="panel">
      <p className="eyebrow">{title}</p>
      <div className="file-list">
        {files.length === 0 ? (
          <p className="muted">No downloadable source found.</p>
        ) : (
          files.map((file) => {
            const key = `${file.role}:${file.assetId}`;
            return (
              <label className="file-row" key={key}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(key)}
                  disabled={!file.available || !file.blob}
                  onChange={() => onToggle(key)}
                />
                <span>
                  <strong>{file.name ?? `${file.role} ${file.assetId}`}</strong>
                  <small>
                    {file.role} · {file.extension ?? "unknown"} · {file.available ? "available" : file.status}
                  </small>
                </span>
                {file.byteLength ? <code>{formatBytes(file.byteLength)}</code> : null}
              </label>
            );
          })
        )}
      </div>
    </section>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
