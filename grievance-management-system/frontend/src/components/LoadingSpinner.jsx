export default function LoadingSpinner({ label = "Loading…" }) {
  return (
    <div className="loading-wrap">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}
