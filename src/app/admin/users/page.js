"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppHeader from "../../components/AppHeader";
import Sidebar from "../../components/Sidebar";
import { useSession } from "next-auth/react";

export default function ManageUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
        } else {
          setError(data.error || "Failed to load users");
        }
      } catch (err) {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  async function toggleRole(userId, currentRole) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    
    // Prevent self-downgrade (API also prevents this, but good to catch early)
    if (newRole === "USER" && users.find(u => u.id === userId)?.email === session?.user?.email) {
      alert("You cannot downgrade your own account. Ask another admin to do this.");
      return;
    }

    setTogglingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        alert(data.error || "Failed to update role");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setTogglingId(null);
    }
  }

  async function deleteUser(userId, email) {
    if (email === session?.user?.email) {
      alert("You cannot delete your own account.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${email}? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      
      if (data.success) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.username || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content admin-page-content">
          <p className="eyebrow">
            <Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>&larr; Back to Admin</Link>
          </p>
          
          <div className="admin-heading-row" style={{ marginBottom: "2rem" }}>
            <div>
              <h1>Manage Users</h1>
              <p className="inner-page-lede">View and manage registered accounts and their permissions.</p>
            </div>
            <Link href="/admin/new-admin" className="inner-page-button" style={{ textDecoration: "none", margin: 0 }}>+ Add Admin</Link>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <input 
              type="text" 
              placeholder="Search by name, email, or username..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="auth-input"
              style={{ maxWidth: "400px", margin: 0 }}
            />
          </div>

          {loading ? (
            <div className="q-loading">
              <div className="q-loading-spinner" />
              <span>Loading users...</span>
            </div>
          ) : error ? (
            <div className="q-empty">
              <p style={{ color: "#d32f2f" }}>{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="q-empty">
              <p>No users found.</p>
            </div>
          ) : (
            <div className="q-table-wrap">
              <table className="q-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}></th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th style={{ width: "200px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="q-row">
                      <td>
                        <div className="admin-user-avatar" style={{ width: "32px", height: "32px", fontSize: "0.85rem", margin: 0 }}>
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <strong style={{ color: "var(--ink)", fontWeight: 600 }}>{user.name || "Unnamed user"}</strong>
                          <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{user.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-role admin-role-${user.role.toLowerCase()}`} style={{ margin: 0 }}>{user.role}</span>
                      </td>
                      <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button 
                            className="inner-page-button"
                            style={{ 
                              padding: "0.3rem 0.6rem", 
                              fontSize: "0.75rem", 
                              margin: 0, 
                              background: "transparent", 
                              border: "1px solid var(--line)", 
                              color: "var(--ink)",
                              opacity: togglingId === user.id ? 0.5 : 1
                            }}
                            onClick={() => toggleRole(user.id, user.role)}
                            disabled={togglingId === user.id || deletingId === user.id}
                          >
                            {user.role === "ADMIN" ? "Demote" : "Make Admin"}
                          </button>
                          
                          <button 
                            className="inner-page-button"
                            style={{ 
                              padding: "0.3rem 0.6rem", 
                              fontSize: "0.75rem", 
                              margin: 0, 
                              background: "transparent", 
                              border: "1px solid #ffcdd2", 
                              color: "#d32f2f",
                              opacity: deletingId === user.id ? 0.5 : 1
                            }}
                            onClick={() => deleteUser(user.id, user.email)}
                            disabled={togglingId === user.id || deletingId === user.id}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
