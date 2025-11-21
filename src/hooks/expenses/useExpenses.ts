import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface Expense {
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
  eventId: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  splits?: Array<{
    id: string;
    amount: number;
    settled: boolean;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
}

interface CreateExpenseData {
  eventId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  date: string;
  paidByUserId: string;
  splits: Array<{
    userId: string;
    amount: number;
  }>;
  category?: string;
  location?: string;
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
    onMutate: async (newExpense) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: expenseKeys.list(newExpense.eventId),
      });

      // Snapshot the previous value
      const previousExpenses = queryClient.getQueryData<Expense[]>(
        expenseKeys.list(newExpense.eventId)
      );

      // Optimistically update to the new value
      const optimisticExpense: Expense = {
        id: `temp-${Date.now()}`,
        description: newExpense.title,
        amount: newExpense.amount,
        currency: newExpense.currency,
        date: newExpense.date,
        paidBy: {
          id: newExpense.paidByUserId,
          name: null,
          email: "",
        },
        eventId: newExpense.eventId,
        images: newExpense.images || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        splits: newExpense.splits.map((split) => ({
          id: `temp-split-${Date.now()}-${split.userId}`,
          amount: split.amount,
          settled: false,
          user: {
            id: split.userId,
            name: null,
            email: "",
          },
        })),
      };

      queryClient.setQueryData<Expense[]>(
        expenseKeys.list(newExpense.eventId),
        (old) => (old ? [optimisticExpense, ...old] : [optimisticExpense])
      );

      return { previousExpenses };
    },
    onError: (err, newExpense, context) => {
      // Rollback on error
      if (context?.previousExpenses) {
        queryClient.setQueryData(
          expenseKeys.list(newExpense.eventId),
          context.previousExpenses
        );
      }
    },
    onSuccess: (_, variables) => {
      // Refetch to get the real data from server
      queryClient.invalidateQueries({
        queryKey: expenseKeys.list(variables.eventId),
      });
    },
  });
}
