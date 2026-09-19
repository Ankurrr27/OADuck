export default function Loading() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--ink)",
      fontFamily: "var(--font-sans)"
    }}>
      <div className="q-loading-spinner" style={{ width: "40px", height: "40px", borderWidth: "3px" }} />
      <p style={{ marginTop: "1rem", color: "var(--muted)", fontWeight: 500 }}>Loading...</p>
    </div>
  );
}
