import { z } from "zod";

// Timeline DTOs
export const createTimelineValidator = z.object({
  eventId: z.uuid(),
});

export type CreateTimelineDto = z.infer<typeof createTimelineValidator>;

// Timeline Item DTOs
export const createTimelineItemValidator = z.object({
  timelineId: z.uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  order: z.number().int().min(0),
  color: z.string().optional(),
  completed: z.boolean().default(false),
});

export const updateTimelineItemValidator = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  order: z.number().int().min(0).optional(),
  color: z.string().optional(),
  completed: z.boolean().optional(),
});

export const reorderTimelineItemsValidator = z.object({
  items: z.array(
    z.object({
      id: z.uuid(),
      order: z.number().int().min(0),
    })
  ),
});

export type CreateTimelineItemDto = z.infer<typeof createTimelineItemValidator>;
export type UpdateTimelineItemDto = z.infer<typeof updateTimelineItemValidator>;
export type ReorderTimelineItemsDto = z.infer<
  typeof reorderTimelineItemsValidator
>;
