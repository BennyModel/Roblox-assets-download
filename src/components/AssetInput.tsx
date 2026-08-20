import type { FormEvent } from "react";
import type { ResolverMode } from "../types";

interface Props {
  mode: ResolverMode;
  input: string;
  loading: boolean;
  onModeChange: (mode: ResolverMode) => void;
  onInputChange: (input: string) => void;
  onSubmit: () => void;
}

export function AssetInput({
  mode,
  input,
  loading,
  onModeChange,
  onInputChange,
  onSubmit,
}: Props) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="input-panel" onSubmit={handleSubmit}>
      <div className="mode-tabs" role="tablist" aria-label="Downloader mode">
        {(["asset", "bundle", "avatar"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={mode === item ? "active" : ""}
            onClick={() => onModeChange(item)}
          >
            {item === "asset" ? "Asset" : item === "bundle" ? "Bundle" : "Download Avatar"}
          </button>
        ))}
      </div>
      <div className="field-row">
        <input
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder={mode === "avatar" ? "Username or User ID" : "Paste Roblox URL or Asset ID"}
          aria-label={mode === "avatar" ? "Username or User ID" : "Paste Roblox URL or Asset ID"}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : mode === "avatar" ? "Load Avatar" : "Load Asset"}
        </button>
      </div>
    </form>
  );
}
