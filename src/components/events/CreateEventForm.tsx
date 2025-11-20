"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const createEventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(100),
  description: z.string().optional(),
  startAt: z.string().min(1, "Start date is required"),
  endAt: z.string().min(1, "End date is required"),
  currency: z.string().min(1),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

export function CreateEventForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      currency: "USD",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEventFormData) => {
      const response = await axios.post("/api/events", {
        ...data,
        startAt: new Date(data.startAt).toISOString(),
        endAt: new Date(data.endAt).toISOString(),
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Event created successfully!");
      router.push(`/events/${data.id}`);
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError.response?.data?.message || "Failed to create event"
      );
    },
  });

  const onSubmit = async (data: CreateEventFormData) => {
    setIsSubmitting(true);
    try {
      await createEventMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Event Name *</Label>
        <Input
          id="name"
          placeholder="Summer Trip to Japan"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          placeholder="Describe your trip..."
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startAt">Start Date *</Label>
          <Input id="startAt" type="date" {...register("startAt")} />
          {errors.startAt && (
            <p className="text-sm text-red-600">{errors.startAt.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endAt">End Date *</Label>
          <Input id="endAt" type="date" {...register("endAt")} />
          {errors.endAt && (
            <p className="text-sm text-red-600">{errors.endAt.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <select
          id="currency"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          {...register("currency")}
        >
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
          <option value="JPY">JPY - Japanese Yen</option>
          <option value="AUD">AUD - Australian Dollar</option>
          <option value="CAD">CAD - Canadian Dollar</option>
          <option value="SGD">SGD - Singapore Dollar</option>
          <option value="THB">THB - Thai Baht</option>
        </select>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
