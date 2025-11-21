import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Plus, TrendingUp, Users } from "lucide-react";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard - Travelkon",
  description: "Manage your travel events and expenses",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Only admin can access dashboard
  if (!isAdmin(session.user.email)) {
    redirect("/events");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {session.user.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Manage your travel events and expenses
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/events/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No events yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Expenses
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">No expenses tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Just you for now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settlements</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">All settled up</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>
              You haven&apos;t created any events yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                Create your first travel event to start planning and tracking
                expenses
              </p>
              <Button asChild>
                <Link href="/events/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Event
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/events/create">
                <Calendar className="mr-2 h-4 w-4" />
                Create Event
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start"
              disabled
            >
              <Link href="/expenses/create">
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start"
              disabled
            >
              <Link href="/settings">
                <Users className="mr-2 h-4 w-4" />
                Invite Members
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
