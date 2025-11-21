"use client";

import { useEvents, type Event } from "@/hooks/events/useEvents";
import { useTimeline } from "@/hooks/timeline/useTimeline";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarTimeline } from "./CalendarTimeline";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function TimelinePageClient() {
  const { data: events, isLoading: eventsLoading } = useEvents();

  if (eventsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-16 space-y-4">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No events yet</h3>
            <p className="text-muted-foreground">
              Create an event to start planning your timeline
            </p>
          </div>
          <Button asChild>
            <Link href="/events">Go to Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="h-8 w-8" />
          All Timelines
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage timelines across all your events
        </p>
      </div>

      <div className="space-y-8">
        {events.map((event) => (
          <EventTimelineSection key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

function EventTimelineSection({ event }: { event: Event }) {
  const { data: timeline, isLoading } = useTimeline(event.id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const timelineItems = timeline?.items || [];

  if (timelineItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <Link
              href={`/events/${event.id}`}
              className="hover:underline flex items-center gap-2"
            >
              {event.name}
            </Link>
            <span className="text-sm text-muted-foreground font-normal">
              {format(new Date(event.startAt), "MMM d")} -{" "}
              {format(new Date(event.endAt), "MMM d, yyyy")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No timeline activities for this event</p>
            <Button asChild variant="link">
              <Link href={`/events/${event.id}?tab=timeline`}>
                Add Activities
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Link
            href={`/events/${event.id}`}
            className="hover:underline flex items-center gap-2"
          >
            {event.name}
          </Link>
          <span className="text-sm text-muted-foreground font-normal">
            {format(new Date(event.startAt), "MMM d")} -{" "}
            {format(new Date(event.endAt), "MMM d, yyyy")}
          </span>
        </CardTitle>
        <CardDescription>
          {timelineItems.length}{" "}
          {timelineItems.length === 1 ? "activity" : "activities"} planned
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CalendarTimeline
          eventId={event.id}
          timelineId={timeline?.id || ""}
          startDate={new Date(event.startAt)}
          endDate={new Date(event.endAt)}
          items={timelineItems}
        />
      </CardContent>
    </Card>
  );
}
