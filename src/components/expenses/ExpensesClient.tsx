"use client";

import { useState } from "react";
import { useEvents } from "@/hooks/events/useEvents";
import { useExpensesByEvent } from "@/hooks/expenses/useExpenses";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Receipt,
  Plus,
  Calendar,
  ArrowUpDown,
  UserPlus,
  Share2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { InviteFriendsBox } from "./InviteFriendsBox";
import { ShareUrlDialog } from "./ShareUrlDialog";
import { toast } from "sonner";

interface Event {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  paidBy: {
    id: string;
    name: string | null;
    email: string;
  };
  splits?: {
    id: string;
    amount: number;
    settled: boolean;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }[];
}

interface Balance {
  userId: string;
  userName: string;
  userEmail: string;
  balance: number;
}

interface ExpensesClientProps {
  eventId?: string;
  userId: string;
}

export function ExpensesClient({ eventId, userId }: ExpensesClientProps) {
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch user's events
  const { data: events = [], isLoading: eventsLoading } = useEvents();

  // Use first event if no eventId provided
  const selectedEventId = eventId || events[0]?.id;

  // Fetch expenses for selected event
  const { data: expenses = [], isLoading: expensesLoading } =
    useExpensesByEvent(selectedEventId || "");

  // Get currency from first expense or default to USD
  const currency = expenses[0]?.currency || "USD";

  // Calculate balances
  const balances: Balance[] = [];
  if (expenses.length > 0) {
    const balanceMap = new Map<string, Balance>();

    expenses.forEach((expense) => {
      // Add amount for payer
      const payerId = expense.paidBy.id;
      if (!balanceMap.has(payerId)) {
        balanceMap.set(payerId, {
          userId: payerId,
          userName: expense.paidBy.name || "Unknown",
          userEmail: expense.paidBy.email,
          balance: 0,
        });
      }
      balanceMap.get(payerId)!.balance += expense.amount;

      // Subtract split amounts
      expense.splits?.forEach((split) => {
        if (!balanceMap.has(split.user.id)) {
          balanceMap.set(split.user.id, {
            userId: split.user.id,
            userName: split.user.name || "Unknown",
            userEmail: split.user.email,
            balance: 0,
          });
        }
        balanceMap.get(split.user.id)!.balance -= split.amount;
      });
    });

    balances.push(...Array.from(balanceMap.values()));
  }

  // Sort expenses
  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
    }
  });

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const toggleSort = (newSortBy: "date" | "amount") => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  if (eventsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create an event first to track expenses
          </p>
          <Button asChild>
            <Link href="/events/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track and split expenses with your group
          </p>
        </div>
        <Button asChild size="lg">
          <Link href={`/expenses/create?eventId=${selectedEventId}`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Link>
        </Button>
      </div>

      {events.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <Label htmlFor="event-select">Select Event</Label>
            <Select
              value={selectedEventId}
              onValueChange={(value) => {
                window.location.href = `/expenses?eventId=${value}`;
              }}
            >
              <SelectTrigger id="event-select" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Content */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    {selectedEvent?.name || "Expenses"}
                  </CardTitle>
                  <CardDescription>
                    {expenses.length}{" "}
                    {expenses.length === 1 ? "expense" : "expenses"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSort("date")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Date
                    {sortBy === "date" && (
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSort("amount")}
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    Amount
                    {sortBy === "amount" && (
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : sortedExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No expenses yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start tracking expenses for this event
                  </p>
                  <Button asChild>
                    <Link href={`/expenses/create?eventId=${selectedEventId}`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Expense
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedExpenses.map((expense) => {
                    const userSplit = expense.splits?.find(
                      (s) => s.user.id === userId
                    );
                    const userOwes = userSplit ? userSplit.amount : 0;
                    const userPaid = expense.paidBy.id === userId;

                    return (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="rounded-lg bg-primary/10 p-3">
                            <Receipt className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold truncate">
                                {expense.description}
                              </h4>
                              <Badge variant="secondary" className="shrink-0">
                                {expense.currency}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Paid by {userPaid ? "you" : expense.paidBy.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(expense.date), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {expense.currency} {expense.amount.toFixed(2)}
                          </div>
                          {userOwes > 0 && !userPaid && (
                            <div className="text-sm text-red-600 flex items-center justify-end gap-1">
                              <TrendingDown className="h-3 w-3" />
                              you owe {expense.currency} {userOwes.toFixed(2)}
                            </div>
                          )}
                          {userPaid && (
                            <div className="text-sm text-green-600 flex items-center justify-end gap-1">
                              <TrendingUp className="h-3 w-3" />
                              you paid
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Group Balances */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Group Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {balances.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No expenses to calculate balances
                </p>
              ) : (
                <div className="space-y-3">
                  {balances.map((balance) => {
                    const isCurrentUser = balance.userId === userId;
                    const displayName = isCurrentUser
                      ? "You"
                      : balance.userName;

                    return (
                      <div
                        key={balance.userId}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                            {balance.userName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium">
                            {displayName}
                          </span>
                        </div>
                        <div
                          className={`text-sm font-semibold flex items-center gap-1 ${
                            balance.balance > 0
                              ? "text-green-600"
                              : balance.balance < 0
                              ? "text-red-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {balance.balance > 0 ? (
                            <>
                              <TrendingUp className="h-3 w-3" />
                              gets back {currency}{" "}
                              {Math.abs(balance.balance).toFixed(2)}
                            </>
                          ) : balance.balance < 0 ? (
                            <>
                              <TrendingDown className="h-3 w-3" />
                              owes {currency}{" "}
                              {Math.abs(balance.balance).toFixed(2)}
                            </>
                          ) : (
                            "settled up"
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invite Friends */}
          {selectedEventId && <InviteFriendsBox eventId={selectedEventId} />}

          {/* Share URL */}
          {selectedEventId && selectedEvent && (
            <ShareUrlDialog
              eventId={selectedEventId}
              eventName={selectedEvent.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}
