import { redirect } from "next/navigation";
import { auth } from "../auth";
import AuthForm from "./components/AuthForm";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/practice");
  return <AuthForm initialMode="login" />;
}
