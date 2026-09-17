import { redirect } from "next/navigation";
import AppHeader from "../components/AppHeader";
import Sidebar from "../components/Sidebar";
import { auth } from "../../auth";

export default async function AdminPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content">
          <p className="eyebrow">Administration</p>
          <h1>Admin dashboard</h1>
          <p className="inner-page-lede">Restricted to authorized administrators.</p>
          <div className="profile-form">
            <strong>Signed in as</strong>
            <p>{session.user.email}</p>
            <strong>Role</strong>
            <p>{session.user.role}</p>
          </div>
        </section>
      </div>
    </main>
  );
}