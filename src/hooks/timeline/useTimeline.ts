import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/common/axios";
import type { Timeline, TimelineItem } from "@prisma/client";

type TimelineWithItems = Timeline & {
  items: (TimelineItem & {
    notes?: Array<{ id: string; content: string; author: { name: string } }>;
    images?: Array<{ id: string; url: string; caption?: string }>;
  })[];
};

type CreateTimelineItemDto = {
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime?: string;
  order: number;
  color?: string;
  completed?: boolean;
};

type UpdateTimelineItemDto = Partial<CreateTimelineItemDto>;

/**
 * Hook to fetch timeline for an event
 */
export function useTimeline(eventId: string) {
  return useQuery<TimelineWithItems>({
    queryKey: ["timeline", eventId],
    queryFn: async () => {
      const { data } = await axios.get(`/timeline?eventId=${eventId}`);
      return data;
    },
    enabled: !!eventId,
  });
}

/**
 * Hook to fetch timeline items
 */
export function useTimelineItems(eventId: string) {
  return useQuery<{ items: TimelineItem[] }>({
    queryKey: ["timeline-items", eventId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/events/${eventId}/timeline/items`);
      return data;
    },
    enabled: !!eventId,
  });
}

/**
 * Hook to create timeline item
 */
export function useCreateTimelineItem(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateTimelineItemDto & { timelineId: string }
    ) => {
      const { data: item } = await axios.post(
        `/timeline/${data.timelineId}/items`,
        data
      );
      return item;
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["timeline", eventId] });

      const previousTimeline = queryClient.getQueryData<TimelineWithItems>([
        "timeline",
        eventId,
      ]);

      if (previousTimeline) {
        // Create optimistic item with temporary ID
        const optimisticItem: TimelineItem = {
          id: `temp-${Date.now()}`,
          timelineId: data.timelineId,
          title: data.title,
          description: data.description || null,
          location: data.location || null,
          startTime: new Date(data.startTime),
          endTime: data.endTime ? new Date(data.endTime) : null,
          order: data.order,
          color: data.color || null,
          completed: data.completed || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        queryClient.setQueryData<TimelineWithItems>(["timeline", eventId], {
          ...previousTimeline,
          items: [...previousTimeline.items, optimisticItem],
        });
      }

      return { previousTimeline };
    },
    onError: (err, data, context) => {
      if (context?.previousTimeline) {
        queryClient.setQueryData(
          ["timeline", eventId],
          context.previousTimeline
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline", eventId] });
    },
  });
}

/**
 * Hook to update timeline item
 */
export function useUpdateTimelineItem(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      timelineId,
      data,
    }: {
      itemId: string;
      timelineId: string;
      data: UpdateTimelineItemDto;
    }) => {
      const { data: item } = await axios.patch(
        `/timeline/${timelineId}/items/${itemId}`,
        data
      );
      return item;
    },
    onMutate: async ({ itemId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["timeline", eventId] });

      const previousTimeline = queryClient.getQueryData<TimelineWithItems>([
        "timeline",
        eventId,
      ]);

      if (previousTimeline) {
        queryClient.setQueryData<TimelineWithItems>(["timeline", eventId], {
          ...previousTimeline,
          items: previousTimeline.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  ...data,
                  // Handle date conversion - data has string dates from DTO, item has Date objects from Prisma
                  startTime: data.startTime
                    ? (data.startTime as unknown as Date)
                    : item.startTime,
                  endTime: data.endTime
                    ? (data.endTime as unknown as Date)
                    : item.endTime,
                }
              : item
          ),
        });
      }

      return { previousTimeline };
    },
    onError: (err, variables, context) => {
      if (context?.previousTimeline) {
        queryClient.setQueryData(
          ["timeline", eventId],
          context.previousTimeline
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline", eventId] });
    },
  });
}

/**
 * Hook to delete timeline item
 */
export function useDeleteTimelineItem(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      timelineId,
    }: {
      itemId: string;
      timelineId: string;
    }) => {
      await axios.delete(`/timeline/${timelineId}/items/${itemId}`);
    },
    onMutate: async ({ itemId }) => {
      await queryClient.cancelQueries({ queryKey: ["timeline", eventId] });

      const previousTimeline = queryClient.getQueryData<TimelineWithItems>([
        "timeline",
        eventId,
      ]);

      if (previousTimeline) {
        queryClient.setQueryData<TimelineWithItems>(["timeline", eventId], {
          ...previousTimeline,
          items: previousTimeline.items.filter((item) => item.id !== itemId),
        });
      }

      return { previousTimeline };
    },
    onError: (err, variables, context) => {
      if (context?.previousTimeline) {
        queryClient.setQueryData(
          ["timeline", eventId],
          context.previousTimeline
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline", eventId] });
    },
  });
}

/**
 * Hook to reorder timeline items
 */
export function useReorderTimelineItems(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      timelineId,
      items,
    }: {
      timelineId: string;
      items: Array<{ id: string; order: number }>;
    }) => {
      await axios.patch(`/timeline/${timelineId}/items`, { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline", eventId] });
    },
  });
}
