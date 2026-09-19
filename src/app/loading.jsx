import DuckLoader from "./components/DuckLoader";

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f4ef] px-6 text-[#17221e]">
      <DuckLoader />
    </main>
  );
}
