"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, DollarSign } from "lucide-react";
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

interface EventsListProps {
  userId: string;
}

export function EventsList({ userId }: EventsListProps) {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["events", userId],
    queryFn: async () => {
      const { data } = await axios.get("/api/events");
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Create your first travel event to start planning and tracking
            expenses
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Link key={event.id} href={`/events/${event.id}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            {event.coverImage && (
              <div className="h-32 bg-linear-to-br from-blue-500 to-purple-500 rounded-t-lg" />
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{event.name}</CardTitle>
                <Badge variant="secondary">{event.currency}</Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {event.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    {format(new Date(event.startAt), "MMM d")} -{" "}
                    {format(new Date(event.endAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>{event._count.members} members</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    <span>{event._count.expenses} expenses</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
