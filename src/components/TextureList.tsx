import type { DownloadableAsset } from "../types";
import { FileList } from "./FileList";

interface Props {
  textures: DownloadableAsset[];
  selectedIds: Set<string>;
  onToggle: (key: string) => void;
}

export function TextureList(props: Props) {
  return <FileList title="Textures" files={props.textures} selectedIds={props.selectedIds} onToggle={props.onToggle} />;
}
