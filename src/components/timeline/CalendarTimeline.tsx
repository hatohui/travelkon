"use client";

import { useState, useRef } from "react";
import {
  useCreateTimelineItem,
  useUpdateTimelineItem,
  useDeleteTimelineItem,
} from "@/hooks/timeline/useTimeline";
import type { TimelineItem } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format, eachDayOfInterval, isSameDay } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CalendarTimelineProps {
  eventId: string;
  timelineId: string;
  startDate: Date;
  endDate: Date;
  items: TimelineItem[];
}

interface TimeSlot {
  hour: number;
  day: Date;
}

interface DragState {
  isDragging: boolean;
  startSlot: TimeSlot | null;
  endSlot: TimeSlot | null;
  dragType: "create" | "resize" | null;
  itemId?: string;
}

interface EditingItem {
  id?: string;
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  color: string;
}

export function CalendarTimeline({
  eventId,
  timelineId,
  startDate,
  endDate,
  items,
}: CalendarTimelineProps) {
  const createMutation = useCreateTimelineItem(eventId);
  const updateMutation = useUpdateTimelineItem(eventId);
  const deleteMutation = useDeleteTimelineItem(eventId);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startSlot: null,
    endSlot: null,
    dragType: null,
  });

  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    item: EditingItem | null;
  }>({
    open: false,
    item: null,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate days array
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Hours: 6 AM to 11 PM
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  // Calculate item position and height
  const getItemStyle = (item: TimelineItem, day: Date) => {
    const itemStart = new Date(item.startTime);
    const itemEnd = item.endTime ? new Date(item.endTime) : itemStart;

    if (!isSameDay(itemStart, day)) return null;

    const startHour = itemStart.getHours();
    const startMinute = itemStart.getMinutes();
    const durationMs = itemEnd.getTime() - itemStart.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    // Calculate position from 6 AM
    const topOffset = (startHour - 6 + startMinute / 60) * 64; // 64px per hour
    const height = durationHours * 64;

    return {
      top: `${topOffset}px`,
      height: `${Math.max(height, 32)}px`,
    };
  };

  // Handle slot click - open create dialog
  const handleSlotClick = (day: Date, hour: number) => {
    if (dragState.isDragging) return;

    const startTime = new Date(day);
    startTime.setHours(hour, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(hour + 1, 0, 0, 0);

    setEditDialog({
      open: true,
      item: {
        title: "",
        description: "",
        location: "",
        startTime,
        endTime,
        color: "#3b82f6",
      },
    });
  };

  // Handle drag start for creating new item
  const handleDragStart = (day: Date, hour: number) => {
    setDragState({
      isDragging: true,
      startSlot: { day, hour },
      endSlot: { day, hour },
      dragType: "create",
    });
  };

  // Handle drag move
  const handleDragMove = (day: Date, hour: number) => {
    if (!dragState.isDragging) return;

    setDragState((prev) => ({
      ...prev,
      endSlot: { day, hour },
    }));
  };

  // Handle drag end - open create dialog with selected range
  const handleDragEnd = () => {
    if (!dragState.startSlot || !dragState.endSlot) {
      setDragState({
        isDragging: false,
        startSlot: null,
        endSlot: null,
        dragType: null,
      });
      return;
    }

    const { startSlot, endSlot } = dragState;

    // Calculate actual start and end times
    const startTime = new Date(startSlot.day);
    startTime.setHours(Math.min(startSlot.hour, endSlot.hour), 0, 0, 0);

    const endTime = new Date(endSlot.day);
    endTime.setHours(Math.max(startSlot.hour, endSlot.hour) + 1, 0, 0, 0);

    // Reset drag state
    setDragState({
      isDragging: false,
      startSlot: null,
      endSlot: null,
      dragType: null,
    });

    // Open dialog with the range
    setEditDialog({
      open: true,
      item: {
        title: "",
        description: "",
        location: "",
        startTime,
        endTime,
        color: "#3b82f6",
      },
    });
  };

  // Check if slot is in drag selection
  const isSlotSelected = (day: Date, hour: number) => {
    if (!dragState.isDragging || !dragState.startSlot || !dragState.endSlot)
      return false;

    const { startSlot, endSlot } = dragState;

    // For single-day drag
    if (isSameDay(startSlot.day, endSlot.day)) {
      if (!isSameDay(day, startSlot.day)) return false;

      const minHour = Math.min(startSlot.hour, endSlot.hour);
      const maxHour = Math.max(startSlot.hour, endSlot.hour);
      return hour >= minHour && hour <= maxHour;
    }

    return false;
  };

  // Handle item edit click
  const handleEditItem = (item: TimelineItem) => {
    setEditDialog({
      open: true,
      item: {
        id: item.id,
        title: item.title,
        description: item.description || "",
        location: item.location || "",
        startTime: new Date(item.startTime),
        endTime: item.endTime
          ? new Date(item.endTime)
          : new Date(item.startTime),
        color: item.color || "#3b82f6",
      },
    });
  };

  // Handle item delete
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Delete this activity?")) return;

    try {
      await deleteMutation.mutateAsync({ itemId, timelineId });
      toast.success("Activity deleted");
    } catch {
      toast.error("Failed to delete activity");
    }
  };

  // Handle save from dialog
  const handleSave = async () => {
    if (!editDialog.item) return;

    const { id, title, description, location, startTime, endTime, color } =
      editDialog.item;

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    // Close dialog immediately for faster perceived performance
    setEditDialog({ open: false, item: null });

    try {
      if (id) {
        // Update existing
        await updateMutation.mutateAsync({
          itemId: id,
          timelineId,
          data: {
            title,
            description: description || undefined,
            location: location || undefined,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            color,
            order: 0,
          },
        });
        toast.success("Activity updated");
      } else {
        // Create new
        await createMutation.mutateAsync({
          timelineId,
          title,
          description: description || undefined,
          location: location || undefined,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          color,
          order: items.length,
          completed: false,
        });
        toast.success("Activity created");
      }
    } catch {
      toast.error(
        id ? "Failed to update activity" : "Failed to create activity"
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p>• Click a time slot to create an activity</p>
        <p>• Click and drag to create an activity spanning multiple hours</p>
        <p>• Click on an activity to edit or delete it</p>
      </div>

      {/* Calendar Grid */}
      <div
        ref={containerRef}
        className="border rounded-lg overflow-auto bg-background"
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        <div className="inline-block min-w-full">
          {/* Header with dates */}
          <div className="sticky top-0 z-20 bg-background border-b">
            <div className="flex">
              {/* Time column header */}
              <div className="w-20 shrink-0 border-r bg-muted/50" />

              {/* Day headers */}
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className="flex-1 min-w-[200px] p-3 text-center border-r last:border-r-0"
                >
                  <div className="font-semibold">{format(day, "EEE")}</div>
                  <div className="text-2xl font-bold">{format(day, "d")}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(day, "MMM")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time slots grid */}
          <div className="flex">
            {/* Time labels column */}
            <div className="w-20 shrink-0 border-r bg-muted/50">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b flex items-start justify-center pt-1 text-xs text-muted-foreground"
                >
                  {format(new Date().setHours(hour, 0, 0, 0), "h a")}
                </div>
              ))}
            </div>

            {/* Days columns */}
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className="flex-1 min-w-[200px] border-r last:border-r-0 relative"
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className={cn(
                      "h-16 border-b relative cursor-pointer transition-colors hover:bg-muted/50",
                      isSlotSelected(day, hour) && "bg-primary/20"
                    )}
                    onClick={() => handleSlotClick(day, hour)}
                    onMouseDown={() => handleDragStart(day, hour)}
                    onMouseEnter={() => handleDragMove(day, hour)}
                    onMouseUp={handleDragEnd}
                  />
                ))}

                {/* Overlay items for this day */}
                <div className="absolute inset-0 pointer-events-none">
                  {items
                    .filter((item) => isSameDay(new Date(item.startTime), day))
                    .map((item) => {
                      const style = getItemStyle(item, day);
                      if (!style) return null;

                      return (
                        <div
                          key={item.id}
                          className="absolute left-1 right-1 rounded-md p-2 text-xs text-white shadow-sm overflow-hidden pointer-events-auto cursor-pointer hover:shadow-md transition-shadow"
                          style={{
                            ...style,
                            backgroundColor: item.color || "#3b82f6",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditItem(item);
                          }}
                        >
                          <div className="font-semibold truncate">
                            {item.title}
                          </div>
                          {item.location && (
                            <div className="text-xs opacity-90 truncate">
                              📍 {item.location}
                            </div>
                          )}
                          <div className="text-xs opacity-75">
                            {format(new Date(item.startTime), "h:mm a")}
                            {item.endTime &&
                              ` - ${format(new Date(item.endTime), "h:mm a")}`}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => {
          if (!open) setEditDialog({ open: false, item: null });
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editDialog.item?.id ? "Edit Activity" : "Create Activity"}
            </DialogTitle>
            <DialogDescription>
              {editDialog.item?.id
                ? "Update the activity details"
                : "Add a new activity to your timeline"}
            </DialogDescription>
          </DialogHeader>

          {editDialog.item && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">What?</label>
                <Input
                  placeholder="Activity name"
                  value={editDialog.item.title}
                  onChange={(e) =>
                    setEditDialog({
                      ...editDialog,
                      item: { ...editDialog.item!, title: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Where?</label>
                <Input
                  placeholder="Location"
                  value={editDialog.item.location}
                  onChange={(e) =>
                    setEditDialog({
                      ...editDialog,
                      item: { ...editDialog.item!, location: e.target.value },
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="datetime-local"
                    value={format(
                      editDialog.item.startTime,
                      "yyyy-MM-dd'T'HH:mm"
                    )}
                    onChange={(e) => {
                      const newStart = new Date(e.target.value);
                      setEditDialog({
                        ...editDialog,
                        item: { ...editDialog.item!, startTime: newStart },
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="datetime-local"
                    value={format(
                      editDialog.item.endTime,
                      "yyyy-MM-dd'T'HH:mm"
                    )}
                    onChange={(e) => {
                      const newEnd = new Date(e.target.value);
                      setEditDialog({
                        ...editDialog,
                        item: { ...editDialog.item!, endTime: newEnd },
                      });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Additional details..."
                  value={editDialog.item.description}
                  onChange={(e) =>
                    setEditDialog({
                      ...editDialog,
                      item: {
                        ...editDialog.item!,
                        description: e.target.value,
                      },
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2">
                  {[
                    "#3b82f6",
                    "#ef4444",
                    "#10b981",
                    "#f59e0b",
                    "#8b5cf6",
                    "#ec4899",
                  ].map((color) => (
                    <button
                      key={color}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        editDialog.item?.color === color
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        setEditDialog({
                          ...editDialog,
                          item: { ...editDialog.item!, color },
                        })
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div>
              {editDialog.item?.id && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteItem(editDialog.item!.id!);
                    setEditDialog({ open: false, item: null });
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialog({ open: false, item: null })}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editDialog.item?.id ? "Update" : "Create"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
