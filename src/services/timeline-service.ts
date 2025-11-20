import { timelineRepository } from "@/repositories/timeline-repository";
import { eventRepository } from "@/repositories/event-repository";
import type {
  CreateTimelineItemDto,
  UpdateTimelineItemDto,
  ReorderTimelineItemsDto,
} from "@/types/dtos/timeline";

export class TimelineService {
  /**
   * Create timeline for an event
   */
  async createTimeline(eventId: string, userId: string) {
    const isMember = await eventRepository.isMember(eventId, userId);
    if (!isMember) {
      throw new Error("User is not a member of this event");
    }

    // Check if timeline already exists
    const existing = await timelineRepository.findByEventId(eventId);
    if (existing) {
      throw new Error("Timeline already exists for this event");
    }

    return timelineRepository.create(eventId);
  }

  /**
   * Create or get timeline for an event
   */
  async getOrCreateTimeline(eventId: string, userId: string) {
    // Check access
    const isMember = await eventRepository.isMember(eventId, userId);
    if (!isMember) {
      throw new Error("User is not a member of this event");
    }

    let timeline = await timelineRepository.findByEventId(eventId);
    if (!timeline) {
      timeline = await timelineRepository.create(eventId);
    }

    return timeline;
  }

  /**
   * Get timeline by event ID
   */
  async getTimelineByEventId(eventId: string, userId: string) {
    const isMember = await eventRepository.isMember(eventId, userId);
    if (!isMember) {
      throw new Error("User is not a member of this event");
    }

    return timelineRepository.findByEventId(eventId);
  }

  /**
   * Create timeline item
   */
  async createTimelineItem(data: CreateTimelineItemDto, userId: string) {
    const timeline = await timelineRepository.findById(data.timelineId);
    if (!timeline) {
      throw new Error("Timeline not found");
    }

    const isMember = await eventRepository.isMember(timeline.eventId, userId);
    if (!isMember) {
      throw new Error("User is not a member of this event");
    }

    return timelineRepository.createItem({
      timeline: { connect: { id: data.timelineId } },
      title: data.title,
      description: data.description,
      location: data.location,
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      order: data.order,
      color: data.color,
      completed: data.completed || false,
    });
  }

  /**
   * Update timeline item
   */
  async updateTimelineItem(
    itemId: string,
    data: UpdateTimelineItemDto,
    userId: string
  ) {
    const item = await timelineRepository.findItemById(itemId);
    if (!item) {
      throw new Error("Timeline item not found");
    }

    const timeline = await timelineRepository.findById(item.timelineId);
    if (!timeline) {
      throw new Error("Timeline not found");
    }

    const isMember = await eventRepository.isMember(timeline.eventId, userId);
    if (!isMember) {
      throw new Error("User is not a member of this event");
    }

    const updateData: Record<string, unknown> = {};
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime !== undefined)
      updateData.endTime = data.endTime ? new Date(data.endTime) : null;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.completed !== undefined) updateData.completed = data.completed;

    return timelineRepository.updateItem(itemId, updateData);
  }

  /**
   * Delete timeline item
   */
  async deleteTimelineItem(itemId: string, userId: string) {
    const item = await timelineRepository.findItemById(itemId);
    if (!item) {
      throw new Error("Timeline item not found");
    }

    const timeline = await timelineRepository.findById(item.timelineId);
    if (!timeline) {
      throw new Error("Timeline not found");
    }

    const role = await eventRepository.getMemberRole(timeline.eventId, userId);
    if (!role || (role !== "OWNER" && role !== "ADMIN")) {
      throw new Error("Insufficient permissions");
    }

    return timelineRepository.deleteItem(itemId);
  }

  /**
   * Reorder timeline items (for drag and drop)
   */
  async reorderTimelineItems(
    timelineId: string,
    data: ReorderTimelineItemsDto,
    userId: string
  ) {
    const timeline = await timelineRepository.findById(timelineId);
    if (!timeline) {
      throw new Error("Timeline not found");
    }

    const isMember = await eventRepository.isMember(timeline.eventId, userId);
    if (!isMember) {
      throw new Error("User is not a member of this event");
    }

    await timelineRepository.reorderItems(data.items);

    return timelineRepository.findById(timelineId);
  }

  /**
   * Get timeline item by ID
   */
  async getTimelineItemById(itemId: string, userId: string) {
    const item = await timelineRepository.findItemById(itemId);
    if (!item) {
      return null;
    }

    const timeline = await timelineRepository.findById(item.timelineId);
    if (!timeline) {
      throw new Error("Timeline not found");
    }

    const isMember = await eventRepository.isMember(timeline.eventId, userId);
    if (!isMember) {
      throw new Error("User is not a member of this event");
    }

    return item;
  }

  /**
   * Get timeline items
   */
  async getTimelineItems(timelineId: string, userId: string) {
    const timeline = await timelineRepository.findById(timelineId);
    if (!timeline) {
      throw new Error("Timeline not found");
    }

    const isMember = await eventRepository.isMember(timeline.eventId, userId);
    if (!isMember) {
      throw new Error("User is not a member of this event");
    }

    return timelineRepository.findItemsByTimelineId(timelineId);
  }
}

export const timelineService = new TimelineService();
