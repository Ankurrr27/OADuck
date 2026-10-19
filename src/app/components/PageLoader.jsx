import DuckLoader from "./DuckLoader";

export default function PageLoader({ label = "Loading your workspace…" }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <DuckLoader label={label} />
    </div>
  );
}
