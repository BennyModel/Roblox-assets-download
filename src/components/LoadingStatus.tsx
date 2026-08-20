export function LoadingStatus({ status }: { status?: string }) {
  if (!status) return null;
  return <div className="loading-status">{status}</div>;
}
