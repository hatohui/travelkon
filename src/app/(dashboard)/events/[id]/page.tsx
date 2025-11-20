import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { EventDetailClient } from "@/components/events/EventDetailClient";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Event Details - Travelkon",
};

export default async function EventPage({ params }: EventPageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <EventDetailClient eventId={id} />;
}
