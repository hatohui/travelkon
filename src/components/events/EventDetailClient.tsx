"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Event {
  id: string;
  name: string;
  description: string | null;
  startAt: string;
  endAt: string;
  coverImage: string | null;
  currency: string;
  _count: {
    members: number;
    expenses: number;
  };
}

interface EventDetailClientProps {
  eventId: string;
}

export function EventDetailClient({ eventId }: EventDetailClientProps) {
  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/events/${eventId}`);
      return data;
    },
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="relative">
        {event.coverImage ? (
          <div className="h-48 rounded-lg bg-linear-to-br from-blue-500 to-purple-500" />
        ) : (
          <div className="h-48 rounded-lg bg-linear-to-br from-blue-500 to-purple-500" />
        )}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full bg-linear-to-t from-black/60 to-transparent p-6 rounded-b-lg">
            <div className="flex items-start justify-between">
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
                <p className="text-sm opacity-90">
                  {event.description || "No description"}
                </p>
              </div>
              <Badge variant="secondary" className="bg-white/90">
                {event.currency}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.ceil(
                (new Date(event.endAt).getTime() -
                  new Date(event.startAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(event.startAt), "MMM d")} -{" "}
              {format(new Date(event.endAt), "MMM d, yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event._count.members}</div>
            <p className="text-xs text-muted-foreground">Active participants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event._count.expenses}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expenses</CardTitle>
              <CardDescription>
                Track and split expenses for this event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start tracking expenses for this event
                </p>
                <Button>Add Expense</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Plan activities and itinerary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No timeline items
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a timeline to plan your activities
                </p>
                <Button>Add Activity</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                Manage event participants and roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Loading members...
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Invite friends to join this event
                </p>
                <Button>Invite Members</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
              <CardDescription>
                Photos and memories from the trip
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No photos yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload photos to share with your group
                </p>
                <Button>Upload Photos</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
