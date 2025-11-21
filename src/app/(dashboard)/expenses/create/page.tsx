import { Metadata } from "next";
import { auth } from "@/auth";
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

export default async function CreateExpensePage() {
  const session = await auth();

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
