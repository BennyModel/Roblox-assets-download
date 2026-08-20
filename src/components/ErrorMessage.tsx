export function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="error-message" role="alert">
      {message}
    </div>
  );
}
