import DuckLoader from "./DuckLoader";

export default function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <DuckLoader />
    </div>
  );
}
