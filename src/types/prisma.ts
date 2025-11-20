// Event update data type
export type EventUpdateData = {
  name?: string;
  description?: string | null;
  startAt?: Date;
  endAt?: Date;
  coverImage?: string | null;
  currency?: string;
};

// Expense update data type
export type ExpenseUpdateData = {
  amount?: number;
  title?: string;
  description?: string | null;
  category?: string | null;
  date?: Date;
  location?: string | null;
};

// User data from Prisma with relations
export type UserWithRelations = {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  googleId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Balance calculation type
export type UserBalanceData = {
  amount: number;
  user: UserWithRelations;
};

// User info for settlements (subset of User model)
export type UserInfo = {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
};
