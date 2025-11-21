import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ExpensesClient } from "@/components/expenses/ExpensesClient";

export const metadata: Metadata = {
  title: "Expenses - Travelkon",
  description: "Track and split expenses",
};

export default async function ExpensesPage(props: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <ExpensesClient eventId={searchParams.eventId} userId={session.user.id} />
  );
}
