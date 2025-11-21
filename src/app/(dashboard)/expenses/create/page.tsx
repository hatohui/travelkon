import { Metadata } from "next";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Add Expense - Travelkon",
  description: "Add a new expense to your event",
};

export const dynamic = "force-dynamic";

export default async function CreateExpensePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Expense</h1>
        <p className="text-muted-foreground">
          Track a new expense and split it with your group
        </p>
      </div>

      <ExpenseForm userId={session.user.id} />
    </div>
  );
}
