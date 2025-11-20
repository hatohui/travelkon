"use client";

import { getQueryClient } from "@/config/tanstack";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const TanstackClient = ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default TanstackClient;
