"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import axios from "@/common/axios";
import { toast } from "sonner";

export default function JoinEventPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [eventName, setEventName] = useState<string | null>(null);

  const eventId = params?.eventId as string;

  useEffect(() => {
    // If user is not authenticated, redirect to sign in
    if (status === "unauthenticated") {
      const callbackUrl = `/events/join/${eventId}`;
      router.push(
        `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
    }
  }, [status, eventId, router]);

  const handleJoinEvent = async () => {
    if (!session?.user?.id || !eventId) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(`/api/events/${eventId}/accept-invite`);
      setSuccess(true);
      setEventName(data.event?.name || "the event");
      toast.success("Successfully joined the event!");

      // Redirect to event page after 2 seconds
      setTimeout(() => {
        router.push(`/events/${eventId}`);
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to join event";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render until authenticated
  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Event</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join an event on Travelkon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!success && !error && (
            <>
              <p className="text-sm text-muted-foreground">
                Click the button below to accept the invitation and join this
                event. You&apos;ll be able to view expenses, add your own, and
                collaborate with other members.
              </p>
              <Button
                onClick={handleJoinEvent}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Event"
                )}
              </Button>
            </>
          )}

          {success && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <p className="font-medium">Successfully joined {eventName}!</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecting you to the event page...
              </p>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <p className="font-medium">{error}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/events")}
                  className="flex-1"
                >
                  Go to Events
                </Button>
                <Button
                  onClick={handleJoinEvent}
                  disabled={loading}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
