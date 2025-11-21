import { z } from "zod";

// Expense DTOs
export const createExpenseValidator = z.object({
  eventId: z.uuid(),
  paidByUserId: z.uuid(),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().optional(),
  date: z.string().datetime(),
  location: z.string().optional(),
  splits: z.array(
    z.object({
      userId: z.string().uuid(),
      amount: z.number().positive(),
    })
  ),
});

export const updateExpenseValidator = z.object({
  amount: z.number().positive().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  date: z.string().datetime().optional(),
  location: z.string().optional(),
});

export type CreateExpenseDto = z.infer<typeof createExpenseValidator>;
export type UpdateExpenseDto = z.infer<typeof updateExpenseValidator>;

// Expense Split DTOs
export const updateExpenseSplitValidator = z.object({
  amount: z.number().positive().optional(),
  settled: z.boolean().optional(),
});

export const markSplitSettledValidator = z.object({
  settled: z.boolean(),
});

export type UpdateExpenseSplitDto = z.infer<typeof updateExpenseSplitValidator>;
export type MarkSplitSettledDto = z.infer<typeof markSplitSettledValidator>;

// Settlement calculation response
export type Settlement = {
  from: string; // userId
  to: string; // userId
  amount: number;
  currency: string;
};

export type UserBalance = {
  userId: string;
  userName: string;
  userAvatar: string | null;
  balance: number; // positive = owed to them, negative = they owe
  currency: string;
};

export type SettlementSummary = {
  settlements: Settlement[];
  balances: UserBalance[];
  totalExpenses: number;
  currency: string;
};
