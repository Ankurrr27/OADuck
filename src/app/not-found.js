import Link from "next/link";
import BrandLogo from "./components/BrandLogo";

export default function NotFound() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--ink)",
      fontFamily: "var(--font-sans)",
      padding: "2rem",
      textAlign: "center"
    }}>
      <div style={{ marginBottom: "2rem" }}>
        <BrandLogo />
      </div>
      
      <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🦆</div>
      
      <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "1rem", letterSpacing: "-0.03em" }}>
        404
      </h1>
      
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
        This page flew away
      </h2>
      
      <p style={{ color: "var(--muted)", maxWidth: "400px", marginBottom: "2rem", lineHeight: 1.6 }}>
        The duck you are looking for might have migrated, had its name changed, or is temporarily unavailable.
      </p>
      
      <Link 
        href="/" 
        className="inner-page-button" 
        style={{ textDecoration: "none", display: "inline-flex", padding: "0.8rem 1.5rem" }}
      >
        Return to Pond
      </Link>
    </div>
  );
}
