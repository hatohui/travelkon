import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface Event {
  id: string;
  name: string;
  description: string | null;
  startAt: string;
  endAt: string;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
    expenses: number;
  };
  members?: Array<{
    id: string;
    userId: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
}

interface CreateEventData {
  name: string;
  description?: string;
  startAt: string;
  endAt: string;
  coverImage?: string;
}

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.lists(),
    queryFn: async () => {
      const { data } = await axios.get<Event[]>("/api/events");
      return data;
    },
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: async () => {
      const { data } = await axios.get<Event>(`/api/events/${eventId}`);
      return data;
    },
    enabled: !!eventId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventData) => {
      const response = await axios.post("/api/events", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

export function useInviteToEvent() {
  return useMutation({
    mutationFn: async ({
      eventId,
      emails,
    }: {
      eventId: string;
      emails: string[];
    }) => {
      const { data } = await axios.post(`/api/events/${eventId}/invite`, {
        emails,
      });
      return data;
    },
  });
}

export function useAddEventMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      eventId,
      data,
    }: {
      eventId: string;
      data: { email: string; role: string };
    }) => {
      const response = await axios.post(`/api/events/${eventId}/members`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventKeys.detail(variables.eventId),
      });
    },
  });
}
