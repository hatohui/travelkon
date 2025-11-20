import { prisma } from "@/common/prisma";
import type { Expense, ExpenseSplit, Prisma } from "@prisma/client";

export class ExpenseRepository {
  /**
   * Create a new expense with splits
   */
  async create(
    expenseData: Prisma.ExpenseCreateInput,
    splits: Array<{ userId: string; amount: number }>
  ): Promise<Expense> {
    return prisma.expense.create({
      data: {
        ...expenseData,
        splits: {
          create: splits,
        },
      },
      include: {
        paidBy: true,
        splits: {
          include: {
            user: true,
          },
        },
        images: true,
        notes: {
          include: {
            author: true,
          },
        },
      },
    });
  }

  /**
   * Find expense by ID
   */
  async findById(id: string): Promise<Expense | null> {
    return prisma.expense.findUnique({
      where: { id },
      include: {
        paidBy: true,
        event: true,
        splits: {
          include: {
            user: true,
          },
        },
        images: true,
        notes: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }

  /**
   * Find all expenses for an event
   */
  async findByEventId(eventId: string): Promise<Expense[]> {
    return prisma.expense.findMany({
      where: { eventId },
      include: {
        paidBy: true,
        splits: {
          include: {
            user: true,
          },
        },
        images: true,
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  /**
   * Find expenses paid by a user
   */
  async findByPaidByUserId(userId: string): Promise<Expense[]> {
    return prisma.expense.findMany({
      where: { paidByUserId: userId },
      include: {
        event: true,
        splits: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  /**
   * Update an expense
   */
  async update(id: string, data: Prisma.ExpenseUpdateInput): Promise<Expense> {
    return prisma.expense.update({
      where: { id },
      data,
      include: {
        paidBy: true,
        splits: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Delete an expense
   */
  async delete(id: string): Promise<Expense> {
    return prisma.expense.delete({
      where: { id },
    });
  }

  /**
   * Get expense split by ID
   */
  async findSplitById(id: string): Promise<ExpenseSplit | null> {
    return prisma.expenseSplit.findUnique({
      where: { id },
      include: {
        user: true,
        expense: {
          include: {
            paidBy: true,
            event: true,
          },
        },
      },
    });
  }

  /**
   * Update expense split
   */
  async updateSplit(
    id: string,
    data: Prisma.ExpenseSplitUpdateInput
  ): Promise<ExpenseSplit> {
    return prisma.expenseSplit.update({
      where: { id },
      data,
      include: {
        user: true,
        expense: true,
      },
    });
  }

  /**
   * Mark split as settled
   */
  async markSplitSettled(id: string, settled: boolean): Promise<ExpenseSplit> {
    return prisma.expenseSplit.update({
      where: { id },
      data: {
        settled,
        settledAt: settled ? new Date() : null,
      },
      include: {
        user: true,
        expense: true,
      },
    });
  }

  /**
   * Get all splits for a user in an event
   */
  async findSplitsByUserAndEvent(
    userId: string,
    eventId: string
  ): Promise<ExpenseSplit[]> {
    return prisma.expenseSplit.findMany({
      where: {
        userId,
        expense: {
          eventId,
        },
      },
      include: {
        user: true,
        expense: {
          include: {
            paidBy: true,
          },
        },
      },
      orderBy: {
        expense: {
          date: "desc",
        },
      },
    });
  }

  /**
   * Get unsettled splits for a user
   */
  async findUnsettledSplitsByUser(userId: string): Promise<ExpenseSplit[]> {
    return prisma.expenseSplit.findMany({
      where: {
        userId,
        settled: false,
      },
      include: {
        user: true,
        expense: {
          include: {
            paidBy: true,
            event: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export const expenseRepository = new ExpenseRepository();
