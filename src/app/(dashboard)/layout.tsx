import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={session.user} />
      <main className="container mx-auto py-8 px-4">{children}</main>
      <Toaster />
    </div>
  );
}
