"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppHeader from "../../components/AppHeader";
import Sidebar from "../../components/Sidebar";
import PageLoader from "../../components/PageLoader";
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
    <main className="admin-page min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-60px)] ">
        <Sidebar />
        <section className="w-full max-w-[900px] flex-1 mx-auto px-[clamp(24px,4vw,56px)] py-19 max-w-[1120px]">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-[#a07725]">
            <Link href="/admin" style={{ textDecoration: "none", color: "inherit" }}>&larr; Back to Admin</Link>
          </p>
          
          <div className="flex items-end justify-between gap-6" style={{ marginBottom: "2rem" }}>
            <div>
              <h1>Manage Users</h1>
              <p className="mt-4 text-sm text-[#6f7771]">View and manage registered accounts and their permissions.</p>
            </div>
            <Link href="/admin/new-admin" className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65" style={{ textDecoration: "none", margin: 0 }}>+ Add Admin</Link>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <input 
              type="text" 
              placeholder="Search by name, email, or username..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-10 w-full rounded-md border border-[#d7dad3] bg-[#fffefa] px-3 text-[13px] outline-none focus:border-[#7c9b8d] focus:ring-3 focus:ring-[#123f36]/10"
              style={{ maxWidth: "400px", margin: 0 }}
            />
          </div>

          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <p style={{ color: "#d32f2f" }}>{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <p>No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#dfe1da] bg-white">
              <table className="w-full border-collapse text-[.9rem] [&_thead]:bg-[#fafaf7] [&_th]:border-b [&_th]:border-[#dfe1da] [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-[.78rem] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[.04em] [&_th]:text-[#6f7771] [&_td]:border-b [&_td]:border-[#f0efe8] [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle [&_a]:font-semibold [&_a]:text-[#17221e] [&_a]:no-underline">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}></th>
                    <th>User</th>
                    <th>Role</th>
                    <th style={{ width: "200px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-[#f8f7f2]">
                      <td>
                        <div className="grid h-8.5 w-8.5 shrink-0 place-items-center rounded-full bg-[#123f36] text-[13px] font-bold text-[#f7f5ed]" style={{ width: "32px", height: "32px", fontSize: "0.85rem", margin: 0 }}>
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
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold tracking-[.06em] rounded-full px-2 py-1 text-[10px] font-bold tracking-[.06em]-${user.role.toLowerCase()}`} style={{ margin: 0 }}>{user.role}</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button 
                            className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65"
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
                            className="inline-flex min-h-10 items-center justify-center rounded-md border-0 bg-[#123f36] px-4 py-2 text-[13px] font-semibold text-[#f7f5ed] no-underline disabled:cursor-wait disabled:opacity-65"
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
