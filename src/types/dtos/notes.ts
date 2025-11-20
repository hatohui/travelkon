import { z } from "zod";

// Note DTOs
export const createNoteValidator = z.object({
  content: z.string().min(1),
  authorId: z.string().uuid(),
  eventId: z.string().uuid().optional(),
  expenseId: z.string().uuid().optional(),
  timelineItemId: z.string().uuid().optional(),
});

export const updateNoteValidator = z.object({
  content: z.string().min(1),
});

export type CreateNoteDto = z.infer<typeof createNoteValidator>;
export type UpdateNoteDto = z.infer<typeof updateNoteValidator>;

// Image DTOs (extending existing)
export const createImageValidator = z.object({
  url: z.string().url(),
  publicId: z.string(),
  uploadedById: z.string().uuid(),
  eventId: z.string().uuid().optional(),
  expenseId: z.string().uuid().optional(),
  timelineItemId: z.string().uuid().optional(),
  caption: z.string().optional(),
});

export const updateImageValidator = z.object({
  caption: z.string().optional(),
});

export type CreateImageDto = z.infer<typeof createImageValidator>;
export type UpdateImageDto = z.infer<typeof updateImageValidator>;
