import Image from "next/image";

export default function DuckLoader({ label = "Loading your workspace…", compact = false, large = false }) {
  return (
    <div className={`duck-loader ${compact ? "duck-loader--compact" : ""} ${large ? "duck-loader--large" : ""}`} role="status" aria-live="polite">
      <div className="duck-loader__scene" aria-hidden="true">
        <Image
          className="duck-loader__duck"
          src="/duck-loader.gif"
          alt=""
          width={155}
          height={200}
          unoptimized
          preload
        />
      </div>
      <span className="duck-loader__label">{label}</span>
    </div>
  );
}
