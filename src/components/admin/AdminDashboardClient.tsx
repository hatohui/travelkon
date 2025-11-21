"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, DollarSign, Receipt } from "lucide-react";
import axios from "@/common/axios";

interface Statistics {
  totalEvents: number;
  totalUsers: number;
  totalExpenses: number;
  totalMembers: number;
  totalExpenseAmount: number;
  avgExpenseAmount: number;
  recentEvents: Array<{
    id: string;
    name: string;
    description?: string;
    startAt: string;
    endAt: string;
    createdAt: string;
    members: Array<{
      user: {
        id: string;
        name: string | null;
        email: string;
      };
    }>;
    _count: {
      expenses: number;
      members: number;
    };
  }>;
}

interface Event {
  id: string;
  name: string;
  description?: string;
  startAt: string;
  endAt: string;
  coverImage?: string;
  createdAt: string;
  members: Array<{
    role: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }>;
  expenses: Array<{
    id: string;
    amount: number;
    currency: string;
    title: string;
  }>;
  _count: {
    expenses: number;
    images: number;
    notes: number;
    members: number;
  };
}

export default function AdminDashboardClient() {
  const { data: statistics, isLoading: statsLoading } = useQuery<Statistics>({
    queryKey: ["admin-statistics"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/statistics");
      return response.data;
    },
  });

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/events");
      return response.data;
    },
  });

  if (statsLoading || eventsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of all events, users, and statistics
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.totalUsers}</div>
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
              {statistics?.totalExpenses}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expense Amount
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${statistics?.totalExpenseAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: ${statistics?.avgExpenseAmount.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest 5 events created</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statistics?.recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="font-medium">{event.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.startAt).toLocaleDateString()} -{" "}
                    {new Date(event.endAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {event._count.members} members
                    </Badge>
                    <Badge variant="secondary">
                      {event._count.expenses} expenses
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Created {new Date(event.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Events */}
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            Complete list of all events in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events?.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-2 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{event.name}</p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.startAt).toLocaleDateString()} -{" "}
                      {new Date(event.endAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {event._count.members} members
                  </Badge>
                  <Badge variant="secondary">
                    {event._count.expenses} expenses
                  </Badge>
                  <Badge variant="secondary">
                    {event._count.images} images
                  </Badge>
                  <Badge variant="secondary">{event._count.notes} notes</Badge>
                </div>
                {event.expenses.length > 0 && (
                  <div className="text-sm">
                    <p className="font-medium">Recent Expenses:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {event.expenses.slice(0, 3).map((expense) => (
                        <Badge key={expense.id} variant="outline">
                          {expense.title} - {expense.currency}{" "}
                          {expense.amount.toFixed(2)}
                        </Badge>
                      ))}
                      {event.expenses.length > 3 && (
                        <Badge variant="outline">
                          +{event.expenses.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div className="text-sm">
                  <p className="font-medium">Members:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {event.members.map((member) => (
                      <Badge key={member.user.id} variant="outline">
                        {member.user.name || member.user.email} ({member.role})
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
