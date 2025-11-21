import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    if (isAdmin(session.user.email)) {
      redirect("/dashboard");
    }
    redirect("/events");
  }

  redirect("/auth/signin");
}
