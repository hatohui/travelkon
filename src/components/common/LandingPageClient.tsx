"use client";

import { useEvents } from "@/hooks/events/useEvents";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Receipt, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { User } from "next-auth";

interface LandingPageClientProps {
  user: User;
}

export function LandingPageClient({ user }: LandingPageClientProps) {
  const { data: events = [], isLoading } = useEvents();

  const totalEvents = events.length;
  const upcomingEvents = events.filter(
    (event) => new Date(event.endAt) >= new Date()
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome back, {user.name || user.email}!
          </CardTitle>
          <CardDescription className="text-base">
            Manage your travel events and expenses in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/events/create">
                <Calendar className="mr-2 h-5 w-5" />
                Create Event
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/events">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingEvents} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.reduce((sum, e) => sum + (e._count?.expenses || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.reduce((sum, e) => sum + (e._count?.members || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              People you&apos;re traveling with
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Events</h2>
          <Button asChild variant="ghost">
            <Link href="/events">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Create your first travel event to start planning and tracking
                expenses with your friends
              </p>
              <Button asChild>
                <Link href="/events/create">
                  <Calendar className="mr-2 h-4 w-4" />
                  Create Your First Event
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 6).map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {event.coverImage && (
                    <div
                      className="h-32 bg-cover bg-center rounded-t-lg"
                      style={{ backgroundImage: `url(${event.coverImage})` }}
                    />
                  )}
                  {!event.coverImage && (
                    <div className="h-32 bg-gradient-to-br from-primary/80 to-primary rounded-t-lg" />
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-1">
                      {event.name}
                    </CardTitle>
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
                          <span>{event._count?.members || 0} members</span>
                        </div>
                        <div className="flex items-center">
                          <Receipt className="mr-2 h-4 w-4" />
                          <span>{event._count?.expenses || 0} expenses</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to manage your travel plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              asChild
              variant="outline"
              className="justify-start h-auto py-4"
            >
              <Link href="/expenses">
                <Receipt className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">View Expenses</div>
                  <div className="text-xs text-muted-foreground">
                    Track and split costs
                  </div>
                </div>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="justify-start h-auto py-4"
            >
              <Link href="/events/create">
                <Calendar className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Create Event</div>
                  <div className="text-xs text-muted-foreground">
                    Plan your next trip
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
