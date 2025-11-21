"use client";

import { TimelineItem } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { MapPin, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useUpdateTimelineItem,
  useDeleteTimelineItem,
} from "@/hooks/timeline/useTimeline";
import { toast } from "sonner";
import { AddTimelineItemDialog } from "./AddTimelineItemDialog";

interface SimpleTimelineListProps {
  eventId: string;
  timelineId: string;
  items: TimelineItem[];
}

export function SimpleTimelineList({
  eventId,
  timelineId,
  items,
}: SimpleTimelineListProps) {
  const updateMutation = useUpdateTimelineItem(eventId);
  const deleteMutation = useDeleteTimelineItem(eventId);

  // Group items by date
  const itemsByDate = items.reduce((acc, item) => {
    const dateKey = format(new Date(item.startTime), "yyyy-MM-dd");
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, TimelineItem[]>);

  const sortedDates = Object.keys(itemsByDate).sort();

  const handleToggleComplete = async (item: TimelineItem) => {
    try {
      await updateMutation.mutateAsync({
        itemId: item.id,
        timelineId,
        data: { completed: !item.completed },
      });
      toast.success(
        item.completed ? "Marked as incomplete" : "Marked as complete"
      );
    } catch {
      toast.error("Failed to update item");
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Delete this activity?")) return;

    try {
      await deleteMutation.mutateAsync({ itemId, timelineId });
      toast.success("Activity deleted");
    } catch {
      toast.error("Failed to delete activity");
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <Clock className="h-16 w-16 mx-auto text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold">No activities yet</h3>
          <p className="text-muted-foreground">
            Start planning by adding activities
          </p>
        </div>
        <AddTimelineItemDialog eventId={eventId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "activity" : "activities"}{" "}
          planned
        </p>
        <AddTimelineItemDialog eventId={eventId} />
      </div>

      {sortedDates.map((dateKey) => {
        const dayItems = itemsByDate[dateKey].sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        return (
          <div key={dateKey} className="space-y-3">
            <div className="sticky top-0 bg-background/95 backdrop-blur py-2 z-10 border-b">
              <h3 className="text-lg font-semibold">
                {format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
              </h3>
            </div>

            <div className="space-y-2">
              {dayItems.map((item) => (
                <Card
                  key={item.id}
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
                      onCheckedChange={() => handleToggleComplete(item)}
                      disabled={updateMutation.isPending}
                      className="mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={cn(
                            "font-semibold text-lg",
                            item.completed && "line-through"
                          )}
                        >
                          {item.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(item.startTime), "h:mm a")}
                            {item.endTime &&
                              ` - ${format(new Date(item.endTime), "h:mm a")}`}
                          </span>
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
