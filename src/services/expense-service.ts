import { expenseRepository } from "@/repositories/expense-repository";
import { eventRepository } from "@/repositories/event-repository";
import type { Prisma } from "@prisma/client";
import type {
  CreateExpenseDto,
  UpdateExpenseDto,
  Settlement,
  UserBalance,
  SettlementSummary,
} from "@/types/dtos/expenses";

// Type for Event with members included
type EventWithMembers = Prisma.EventGetPayload<{
  include: {
    members: {
      include: {
        user: true;
      };
    };
  };
}>;

// Type for Expense with splits included
type ExpenseWithSplits = Prisma.ExpenseGetPayload<{
  include: {
    paidBy: true;
    splits: {
      include: {
        user: true;
      };
    };
  };
}>;

export class ExpenseService {
  /**
   * Create a new expense with splits
   */
  async createExpense(data: CreateExpenseDto, userId: string) {
    // Verify user is member of event
    const isMember = await eventRepository.isMember(data.eventId, userId);
    if (!isMember) {
      throw new Error("User is not a member of this event");
    }

    // Validate splits sum matches expense amount
    const totalSplit = data.splits.reduce(
      (sum, split) => sum + split.amount,
      0
    );
    if (Math.abs(totalSplit - data.amount) > 0.01) {
      throw new Error("Split amounts must sum to expense amount");
    }

    const expense = await expenseRepository.create(
      {
        event: { connect: { id: data.eventId } },
        paidBy: { connect: { id: data.paidByUserId } },
        amount: data.amount,
        currency: data.currency,
        title: data.title,
        description: data.description,
        category: data.category,
        date: new Date(data.date),
        location: data.location,
      },
      data.splits
    );

    return expense;
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(expenseId: string) {
    return expenseRepository.findById(expenseId);
  }

  /**
   * Get all expenses for an event
   */
  async getEventExpenses(eventId: string) {
    return expenseRepository.findByEventId(eventId);
  }

  /**
   * Update expense
   */
  async updateExpense(
    expenseId: string,
    data: UpdateExpenseDto,
    userId: string
  ) {
    const expense = await expenseRepository.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    // Only the person who paid or event admins can update
    const role = await eventRepository.getMemberRole(expense.eventId, userId);
    if (
      expense.paidByUserId !== userId &&
      role !== "OWNER" &&
      role !== "ADMIN"
    ) {
      throw new Error("Insufficient permissions");
    }

    const updateData: Partial<{
      amount: number;
      title: string;
      description: string | null;
      category: string | null;
      date: Date;
      location: string | null;
    }> = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.date) updateData.date = new Date(data.date);
    if (data.location !== undefined) updateData.location = data.location;

    return expenseRepository.update(expenseId, updateData);
  }

  /**
   * Delete expense
   */
  async deleteExpense(expenseId: string, userId: string) {
    const expense = await expenseRepository.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    const role = await eventRepository.getMemberRole(expense.eventId, userId);
    if (
      expense.paidByUserId !== userId &&
      role !== "OWNER" &&
      role !== "ADMIN"
    ) {
      throw new Error("Insufficient permissions");
    }

    return expenseRepository.delete(expenseId);
  }

  /**
   * Mark a split as settled/unsettled
   */
  async markSplitSettled(splitId: string, settled: boolean, userId: string) {
    const split = await expenseRepository.findSplitById(splitId);
    if (!split) {
      throw new Error("Split not found");
    }

    const expense = await expenseRepository.findById(split.expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    // Either the person who paid or the person who owes can mark as settled
    if (expense.paidByUserId !== userId && split.userId !== userId) {
      throw new Error("Insufficient permissions");
    }

    return expenseRepository.markSplitSettled(splitId, settled);
  }

  /**
   * Calculate settlement summary for an event
   * This implements the debt simplification algorithm
   */
  async calculateSettlements(eventId: string): Promise<SettlementSummary> {
    const expenses = (await expenseRepository.findByEventId(
      eventId
    )) as ExpenseWithSplits[];
    const event = (await eventRepository.findById(
      eventId
    )) as EventWithMembers | null;

    if (!event) {
      throw new Error("Event not found");
    }

    // Get currency from first expense or default to USD
    const currency = expenses[0]?.currency || "USD";

    // Calculate net balance for each user
    type BalanceEntry = {
      amount: number;
      user: {
        id: string;
        name: string | null;
        email: string;
        avatar: string | null;
      };
    };
    const balances = new Map<string, BalanceEntry>();

    // Initialize balances for all members
    for (const member of event.members) {
      balances.set(member.userId, {
        amount: 0,
        user: member.user,
      });
    }

    // Process expenses
    for (const expense of expenses) {
      // Person who paid gets credited
      const paidByBalance = balances.get(expense.paidByUserId);
      if (paidByBalance) {
        paidByBalance.amount += expense.amount;
      }

      // People who owe get debited
      for (const split of expense.splits) {
        if (!split.settled) {
          const splitBalance = balances.get(split.userId);
          if (splitBalance) {
            splitBalance.amount -= split.amount;
          }
        }
      }
    }

    // Convert to array and separate creditors from debtors
    type CreditorDebtorEntry = {
      userId: string;
      amount: number;
      user: {
        id: string;
        name: string | null;
        email: string;
        avatar: string | null;
      };
    };
    const creditors: CreditorDebtorEntry[] = [];
    const debtors: CreditorDebtorEntry[] = [];

    for (const [userId, data] of balances.entries()) {
      if (data.amount > 0.01) {
        creditors.push({ userId, amount: data.amount, user: data.user });
      } else if (data.amount < -0.01) {
        debtors.push({
          userId,
          amount: Math.abs(data.amount),
          user: data.user,
        });
      }
    }

    // Simplify settlements using greedy algorithm
    const settlements: Settlement[] = [];
    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const settleAmount = Math.min(creditor.amount, debtor.amount);

      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Number(settleAmount.toFixed(2)),
        currency,
      });

      creditor.amount -= settleAmount;
      debtor.amount -= settleAmount;

      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    // Calculate user balances for response
    const userBalances: UserBalance[] = Array.from(balances.entries()).map(
      ([userId, data]) => ({
        userId,
        userName: data.user.name || data.user.email,
        userAvatar: data.user.avatar,
        balance: Number(data.amount.toFixed(2)),
        currency,
      })
    );

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return {
      settlements,
      balances: userBalances,
      totalExpenses: Number(totalExpenses.toFixed(2)),
      currency,
    };
  }

  /**
   * Get user's unsettled splits
   */
  async getUserUnsettledSplits(userId: string) {
    return expenseRepository.findUnsettledSplitsByUser(userId);
  }
}

export const expenseService = new ExpenseService();
