import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { GalleryPageClient } from "@/components/gallery/GalleryPageClient";

export default async function GalleryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <GalleryPageClient />;
}
