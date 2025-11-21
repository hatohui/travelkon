"use client";

import { useParams, useRouter } from "next/navigation";
import { useTimeline } from "@/hooks/timeline/useTimeline";
import { useEvent } from "@/hooks/events/useEvents";
import { CalendarTimeline } from "@/components/timeline/CalendarTimeline";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function TimelinePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const {
    data: timeline,
    isLoading: timelineLoading,
    error,
  } = useTimeline(eventId);

  const isLoading = eventLoading || timelineLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !event || !timeline) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load timeline</p>
          <Button onClick={() => router.push(`/events/${eventId}`)}>
            Back to Event
          </Button>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.startAt);
  const endDate = new Date(event.endAt);
  const items = timeline.items || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/events/${eventId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              {event.name} Timeline
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>

      <CalendarTimeline
        eventId={eventId}
        timelineId={timeline.id}
        startDate={startDate}
        endDate={endDate}
        items={items}
      />
    </div>
  );
}
