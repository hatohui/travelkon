import { z } from "zod";

// Event DTOs
export const createEventValidator = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  coverImage: z.string().optional(),
  currency: z.string().default("USD"),
});

export const updateEventValidator = createEventValidator.partial();

export type CreateEventDto = z.infer<typeof createEventValidator>;
export type UpdateEventDto = z.infer<typeof updateEventValidator>;

// Event Member DTOs
export const addEventMemberValidator = z.object({
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).default("MEMBER"),
});

export const updateEventMemberRoleValidator = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

export type AddEventMemberDto = z.infer<typeof addEventMemberValidator>;
export type UpdateEventMemberRoleDto = z.infer<
  typeof updateEventMemberRoleValidator
>;
