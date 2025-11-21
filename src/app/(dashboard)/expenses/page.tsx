import { Metadata } from "next";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ExpensesClient } from "@/components/expenses/ExpensesClient";

export const metadata: Metadata = {
  title: "Expenses - Travelkon",
  description: "Track and split expenses",
};

export const dynamic = "force-dynamic";

export default async function ExpensesPage(props: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <ExpensesClient eventId={searchParams.eventId} userId={session.user.id} />
  );
}
