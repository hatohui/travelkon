import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  paidBy: string;
  eventId: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface CreateExpenseData {
  eventId: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  paidBy: string;
  splitAmong: string[];
  images?: string[];
}

export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (eventId?: string) => [...expenseKeys.lists(), { eventId }] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};

export function useExpensesByEvent(eventId: string) {
  return useQuery({
    queryKey: expenseKeys.list(eventId),
    queryFn: async () => {
      const { data } = await axios.get<Expense[]>(
        `/api/expenses?eventId=${eventId}`
      );
      return data;
    },
    enabled: !!eventId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpenseData) => {
      const response = await axios.post("/api/expenses", data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: expenseKeys.list(variables.eventId),
      });
    },
  });
}
