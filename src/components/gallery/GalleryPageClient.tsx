"use client";

import { useEvents, type Event } from "@/hooks/events/useEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function GalleryPageClient() {
  const { data: events, isLoading } = useEvents();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-16 space-y-4">
          <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No events yet</h3>
            <p className="text-muted-foreground">
              Create an event to start uploading photos
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
          <ImageIcon className="h-8 w-8" />
          All Photos
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse photos from all your events
        </p>
      </div>

      <div className="space-y-8">
        {events.map((event) => (
          <EventGallerySection key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

function EventGallerySection({ event }: { event: Event }) {
  // For now, we'll show a placeholder since we don't have image data yet
  // In the future, you'll fetch images from the event's gallery

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Link
            href={`/events/${event.id}?tab=gallery`}
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
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p>No photos uploaded for this event yet</p>
          <Button asChild variant="link">
            <Link href={`/events/${event.id}?tab=gallery`}>Upload Photos</Link>
          </Button>
        </div>
        {/* 
          TODO: When you have image data, replace the above with:
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden">
                <img 
                  src={image.url} 
                  alt={image.caption || "Event photo"}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        */}
      </CardContent>
    </Card>
  );
}
