import { useMemo, useState } from "react";
import "./App.css";
import { AssetInput } from "./components/AssetInput";
import { AssetPreview } from "./components/AssetPreview";
import { AssetInfo } from "./components/AssetInfo";
import { FileList } from "./components/FileList";
import { TextureList } from "./components/TextureList";
import { DownloadPanel } from "./components/DownloadPanel";
import { ErrorMessage } from "./components/ErrorMessage";
import { LoadingStatus } from "./components/LoadingStatus";
import type { DownloadableAsset, ResolvedAsset, ResolverMode } from "./types";
import { resolveAsset, resolveAvatar, resolveBundle } from "./assets/assetResolver";
import { buildZip } from "./download/zipBuilder";
import { buildFileName, downloadBlob, sanitizeFileName } from "./download/downloadFile";

function App() {
  const [mode, setMode] = useState<ResolverMode>("asset");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [resolved, setResolved] = useState<ResolvedAsset>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [includeMetadata, setIncludeMetadata] = useState(true);

  const allFiles = useMemo(
    () => [...(resolved?.models ?? []), ...(resolved?.textures ?? [])],
    [resolved],
  );
  const selectedFiles = allFiles.filter((file) => selectedIds.has(fileKey(file)) && file.blob);

  async function handleSubmit() {
    if (!input.trim()) {
      setError(mode === "avatar" ? "Enter a username or User ID." : "Invalid Asset ID");
      return;
    }

    setLoading(true);
    setError("");
    setResolved(undefined);
    setSelectedIds(new Set());

    try {
      const resolver =
        mode === "bundle" ? resolveBundle : mode === "avatar" ? resolveAvatar : resolveAsset;
      const result = await resolver(input, (progress) => setStatus(progress.label));
      setResolved(result);
      setSelectedIds(
        new Set([...result.models, ...result.textures].filter((file) => file.available && file.blob).map(fileKey)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unsupported asset type");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  function toggleFile(key: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectPreset(preset: "all" | "models" | "textures") {
    if (!resolved) return;
    const files =
      preset === "models" ? resolved.models : preset === "textures" ? resolved.textures : allFiles;
    setSelectedIds(new Set(files.filter((file) => file.available && file.blob).map(fileKey)));
  }

  async function handleDownload() {
    if (!resolved || selectedFiles.length === 0) return;
    setStatus("Preparing download...");
    if (selectedFiles.length === 1 && !includeMetadata) {
      const [file] = selectedFiles;
      downloadBlob(file.blob!, buildFileName(file));
      setStatus("Ready");
      return;
    }

    const zip = await buildZip(resolved, selectedFiles, includeMetadata);
    downloadBlob(zip, `${sanitizeFileName(resolved.name)}.zip`);
    setStatus("Ready");
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <div>
          <h1>Roblox Asset Downloader</h1>
          <p>Download publicly available Roblox asset files and textures.</p>
        </div>
        <a href="./ROBLOX_API_RESEARCH.md">API Research</a>
      </header>

      <AssetInput
        mode={mode}
        input={input}
        loading={loading}
        onModeChange={setMode}
        onInputChange={setInput}
        onSubmit={handleSubmit}
      />
      <LoadingStatus status={status} />
      <ErrorMessage message={error} />

      {resolved ? (
        <div className="results-grid">
          <AssetPreview asset={resolved} />
          <AssetInfo asset={resolved} />
          <div className="download-column">
            <DownloadPanel
              includeMetadata={includeMetadata}
              selectedCount={selectedFiles.length}
              onIncludeMetadata={setIncludeMetadata}
              onSelectPreset={selectPreset}
              onDownload={handleDownload}
            />
            <TextureList textures={resolved.textures} selectedIds={selectedIds} onToggle={toggleFile} />
          </div>
          <FileList title="Models" files={resolved.models} selectedIds={selectedIds} onToggle={toggleFile} />
        </div>
      ) : (
        <section className="empty-state">
          <h2>No asset loaded</h2>
          <p>
            Paste an Asset ID, Roblox catalog URL, bundle URL, or public avatar identifier. The page runs entirely in
            your browser and does not use Roblox cookies.
          </p>
        </section>
      )}
    </main>
  );
}

function fileKey(file: DownloadableAsset): string {
  return `${file.role}:${file.assetId}`;
}

export default App;
