"use client";

import { useState } from "react";
import {
  useTimeline,
  useCreateTimelineItem,
} from "@/hooks/timeline/useTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface AddTimelineItemDialogProps {
  eventId: string;
}

export function AddTimelineItemDialog({ eventId }: AddTimelineItemDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: timeline } = useTimeline(eventId);
  const createItemMutation = useCreateTimelineItem(eventId);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    color: "#3b82f6",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.startTime) {
      toast.error("Please provide title and start time");
      return;
    }

    if (!timeline?.id) {
      toast.error("Timeline not ready");
      return;
    }

    try {
      // Calculate the next order value
      const nextOrder = timeline?.items?.length ?? 0;

      await createItemMutation.mutateAsync({
        timelineId: timeline.id,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime
          ? new Date(formData.endTime).toISOString()
          : undefined,
        color: formData.color,
        order: nextOrder,
        completed: false,
      });

      toast.success("Timeline item added!");
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        location: "",
        startTime: "",
        endTime: "",
        color: "#3b82f6",
      });
    } catch (error) {
      toast.error("Failed to add timeline item");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Activity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Activity</DialogTitle>
          <DialogDescription>
            Add a new activity to your timeline. Activities are automatically
            sorted by time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">What are you doing? *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Visit Eiffel Tower, Lunch at cafe..."
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">When? *</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">
              Until? <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Where? <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g., Champ de Mars, Paris"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Notes? <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Any details or reminders..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createItemMutation.isPending}
              className="flex-1"
            >
              {createItemMutation.isPending ? "Adding..." : "Add Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
