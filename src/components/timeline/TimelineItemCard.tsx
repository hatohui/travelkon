"use client";

import { useState } from "react";
import {
  useUpdateTimelineItem,
  useDeleteTimelineItem,
} from "@/hooks/timeline/useTimeline";
import type { TimelineItem } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Clock, Trash2, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TimelineItemCardProps {
  item: TimelineItem;
  eventId: string;
  timelineId: string;
}

export function TimelineItemCard({
  item,
  eventId,
  timelineId,
}: TimelineItemCardProps) {
  const updateMutation = useUpdateTimelineItem(eventId);
  const deleteMutation = useDeleteTimelineItem(eventId);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleComplete = async () => {
    try {
      await updateMutation.mutateAsync({
        itemId: item.id,
        timelineId,
        data: { completed: !item.completed },
      });
      toast.success(
        item.completed ? "Marked as incomplete" : "Marked as complete"
      );
    } catch (error) {
      toast.error("Failed to update item");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this activity?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ itemId: item.id, timelineId });
      toast.success("Activity deleted");
    } catch (error) {
      toast.error("Failed to delete activity");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const startTime = new Date(item.startTime);
  const endTime = item.endTime ? new Date(item.endTime) : null;

  return (
    <Card
      className={cn(
        "p-4 transition-all hover:shadow-md",
        item.completed && "opacity-60"
      )}
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: item.color || "#3b82f6",
      }}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={item.completed}
          onCheckedChange={handleToggleComplete}
          disabled={updateMutation.isPending}
        />

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "font-semibold text-lg",
                item.completed && "line-through"
              )}
            >
              {item.title}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={isDeleting}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}

          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline" className="gap-1">
              <CalendarDays className="h-3 w-3" />
              {format(startTime, "MMM d, yyyy")}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {format(startTime, "h:mm a")}
              {endTime && ` - ${format(endTime, "h:mm a")}`}
            </Badge>
            {item.location && (
              <Badge variant="outline" className="gap-1">
                <MapPin className="h-3 w-3" />
                {item.location}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
