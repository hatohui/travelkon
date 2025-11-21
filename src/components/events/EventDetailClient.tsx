"use client";

import { useEvent } from "@/hooks/events/useEvents";
import { useTimeline } from "@/hooks/timeline/useTimeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleTimelineList } from "@/components/timeline/SimpleTimelineList";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  MapPin,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { InviteMemberDialog } from "./InviteMemberDialog";

interface EventDetailClientProps {
  eventId: string;
}

export function EventDetailClient({ eventId }: EventDetailClientProps) {
  const { data: event, isLoading } = useEvent(eventId);
  const { data: timeline } = useTimeline(eventId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Event not found</h2>
        <Button asChild>
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  const durationDays = Math.ceil(
    (new Date(event.endAt).getTime() - new Date(event.startAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Event Banner */}
      <div className="relative rounded-lg overflow-hidden">
        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.name}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-primary" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
          {event.description && (
            <p className="text-sm opacity-90 max-w-2xl">{event.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(event.startAt), "MMM d")} -{" "}
                {format(new Date(event.endAt), "MMM d, yyyy")}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{durationDays} days</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{event._count?.members || 0} members</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              <span>{event._count?.expenses || 0} expenses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Expenses List */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Expenses</CardTitle>
                    <CardDescription>
                      Track and split expenses for this event
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href={`/expenses?eventId=${eventId}`}>
                      Add Expense
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12">
                    <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No expenses yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Start tracking expenses for this event
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Members & Balances */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base">Members</CardTitle>
                  <InviteMemberDialog eventId={eventId} />
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.members && event.members.length > 0 ? (
                    event.members.map((member) => (
                      <div key={member.id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {member.user.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {member.user.name || member.user.email}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {member.role}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              $0.00
                            </div>
                            <div className="text-xs text-muted-foreground">
                              settled
                            </div>
                          </div>
                        </div>
                        {member.id !==
                          event.members?.[event.members.length - 1]?.id && (
                          <Separator className="mt-3" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">
                        No members yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          {timeline && event ? (
            <SimpleTimelineList
              eventId={eventId}
              timelineId={timeline.id}
              items={timeline.items || []}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Clock className="h-16 w-16 text-muted-foreground animate-spin" />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Event Members</CardTitle>
                <CardDescription>
                  Manage participants and their roles
                </CardDescription>
              </div>
              <InviteMemberDialog eventId={eventId} />
            </CardHeader>
            <CardContent className="space-y-4">
              {event.members && event.members.length > 0 ? (
                event.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {member.user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.user.name || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{member.role}</Badge>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No members yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Invite friends to join this event
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Gallery</CardTitle>
              <CardDescription>
                Photos and memories from your trip
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload photos to share with your group
                </p>
                <Button disabled>Upload Photos</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
