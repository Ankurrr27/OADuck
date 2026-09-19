import AppHeader from "../../components/AppHeader";
import Sidebar from "../../components/Sidebar";
import DuckLoader from "../../components/DuckLoader";

export default function LoadingQuestion() {
  return (
    <main className="min-h-screen bg-[#f5f4ef] text-[#17221e]">
      <AppHeader />
      <div className="flex min-h-[calc(100dvh-60px)]">
        <Sidebar />
        <section className="grid flex-1 place-items-center px-6">
          <DuckLoader large label="Opening your problem…" />
        </section>
      </div>
    </main>
  );
}
