"use client";

import { SessionProvider } from "next-auth/react";
import TanstackClient from "@/components/TanstackClient";
import { ReactNode } from "react";
import { Session } from "next-auth";

export function Providers({
  children,
  session,
}: {
  children: ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <TanstackClient>{children}</TanstackClient>
    </SessionProvider>
  );
}
