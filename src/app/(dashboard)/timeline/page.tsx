import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { TimelinePageClient } from "@/components/timeline/TimelinePageClient";

export default async function TimelinePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <TimelinePageClient />;
}
