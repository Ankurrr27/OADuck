import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import AppHeader from "../../components/AppHeader";
import Sidebar from "../../components/Sidebar";
import BrandLogo from "../../components/BrandLogo";

export async function generateMetadata({ params }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, username: true }
  });

  if (!user) {
    return { title: "User Not Found | OA Duck" };
  }

  return {
    title: `${user.name || user.username}'s Profile | OA Duck`,
    description: `View ${user.name || user.username}'s profile on OA Duck.`,
  };
}

export default async function PublicProfilePage({ params }) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      role: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <main className="inner-page-shell">
      <AppHeader />
      <div className="dashboard-layout inner-page-layout">
        <Sidebar />
        <section className="inner-page-content profile-page-content">
          <div className="flex flex-col items-center justify-center p-8 mt-8 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-center">
            {user.image ? (
              <img 
                src={user.image} 
                alt={`${user.username}'s avatar`} 
                className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-zinc-100 dark:border-zinc-800"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-4xl font-bold mb-4 border-4 border-zinc-100 dark:border-zinc-900 text-zinc-500">
                {(user.name || user.username || "U")[0].toUpperCase()}
              </div>
            )}
            
            <h1 className="text-3xl font-bold mb-1">{user.name || "Anonymous User"}</h1>
            <p className="text-lg text-zinc-500 mb-2">@{user.username}</p>
            
            {user.role === "ADMIN" && (
              <span className="px-3 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-xs font-bold rounded-full mb-6">
                Admin
              </span>
            )}
            
            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 w-full">
              <h2 className="text-xl font-semibold mb-4">Activity</h2>
              <p className="text-zinc-500">This user's practice activity is private.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
