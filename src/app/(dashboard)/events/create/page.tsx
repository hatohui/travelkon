import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreateEventForm } from "@/components/events/CreateEventForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Create Event - Travelkon",
  description: "Create a new travel event",
};

export default async function CreateEventPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Event</h1>
        <p className="text-muted-foreground">
          Set up a new travel event to track expenses and plan activities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Fill in the information about your trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateEventForm />
        </CardContent>
      </Card>
    </div>
  );
}
