import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LandingPageClient } from "@/components/common/LandingPageClient";
import { AppHeader } from "@/components/layout/AppHeader";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  if (isAdmin(session.user.email)) {
    redirect("/dashboard");
  }

  return (
    <>
      <AppHeader user={session.user} />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
          <LandingPageClient user={session.user} />
        </div>
      </main>
      <Toaster />
    </>
  );
}
