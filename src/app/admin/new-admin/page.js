"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppHeader from "../../components/AppHeader";
import Sidebar from "../../components/Sidebar";

export default function AddAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter an email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccess(`Successfully granted Admin privileges to ${email}.`);
        setEmail("");
        
        // Optionally redirect to users list after a short delay
        setTimeout(() => {
          router.push("/admin/users");
        }, 2000);
      } else {
        setError(data.error || "Failed to promote user.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content admin-page-content">
          <p className="eyebrow">
            <Link href="/admin/users" style={{ textDecoration: "none", color: "inherit" }}>&larr; Back to Users</Link>
          </p>
          
          <div className="admin-heading-row" style={{ marginBottom: "2rem" }}>
            <div>
              <h1>Add Admin</h1>
              <p className="inner-page-lede">Grant administrative privileges to an existing user account.</p>
            </div>
          </div>

          <div style={{ maxWidth: "500px" }}>
            <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid var(--line)" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.5rem" }}>
                  User Email Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. learner@example.com" 
                  className="auth-input"
                  style={{ width: "100%", margin: 0 }}
                  required
                />
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem" }}>
                  The user must already be registered in the system.
                </p>
              </div>

              {error && (
                <div style={{ padding: "0.8rem", background: "#ffebee", color: "#c62828", borderRadius: "6px", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{ padding: "0.8rem", background: "#e8f5e9", color: "#2e7d32", borderRadius: "6px", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  {success}
                </div>
              )}

              <button 
                type="submit" 
                className="inner-page-button" 
                style={{ width: "100%", margin: 0, justifyContent: "center" }}
                disabled={loading}
              >
                {loading ? "Processing..." : "Grant Admin Privileges"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
