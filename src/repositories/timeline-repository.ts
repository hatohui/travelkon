import { prisma } from "@/common/prisma";
import type { Timeline, TimelineItem, Prisma } from "@prisma/client";

export class TimelineRepository {
  /**
   * Create a new timeline for an event
   */
  async create(eventId: string): Promise<Timeline> {
    return prisma.timeline.create({
      data: {
        event: {
          connect: { id: eventId },
        },
      },
      include: {
        items: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  /**
   * Find timeline by event ID
   */
  async findByEventId(eventId: string): Promise<Timeline | null> {
    return prisma.timeline.findUnique({
      where: { eventId },
      include: {
        items: {
          include: {
            notes: {
              include: {
                author: true,
              },
            },
            images: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  /**
   * Find timeline by ID
   */
  async findById(id: string): Promise<Timeline | null> {
    return prisma.timeline.findUnique({
      where: { id },
      include: {
        event: true,
        items: {
          include: {
            notes: {
              include: {
                author: true,
              },
            },
            images: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  /**
   * Delete timeline
   */
  async delete(id: string): Promise<Timeline> {
    return prisma.timeline.delete({
      where: { id },
    });
  }

  /**
   * Create timeline item
   */
  async createItem(
    data: Prisma.TimelineItemCreateInput
  ): Promise<TimelineItem> {
    return prisma.timelineItem.create({
      data,
      include: {
        notes: {
          include: {
            author: true,
          },
        },
        images: true,
      },
    });
  }

  /**
   * Find timeline item by ID
   */
  async findItemById(id: string): Promise<TimelineItem | null> {
    return prisma.timelineItem.findUnique({
      where: { id },
      include: {
        timeline: {
          include: {
            event: true,
          },
        },
        notes: {
          include: {
            author: true,
          },
        },
        images: true,
      },
    });
  }

  /**
   * Update timeline item
   */
  async updateItem(
    id: string,
    data: Prisma.TimelineItemUpdateInput
  ): Promise<TimelineItem> {
    return prisma.timelineItem.update({
      where: { id },
      data,
      include: {
        notes: {
          include: {
            author: true,
          },
        },
        images: true,
      },
    });
  }

  /**
   * Delete timeline item
   */
  async deleteItem(id: string): Promise<TimelineItem> {
    return prisma.timelineItem.delete({
      where: { id },
    });
  }

  /**
   * Reorder timeline items
   */
  async reorderItems(
    items: Array<{ id: string; order: number }>
  ): Promise<void> {
    await prisma.$transaction(
      items.map((item) =>
        prisma.timelineItem.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );
  }

  /**
   * Get items by timeline ID
   */
  async findItemsByTimelineId(timelineId: string): Promise<TimelineItem[]> {
    return prisma.timelineItem.findMany({
      where: { timelineId },
      include: {
        notes: {
          include: {
            author: true,
          },
        },
        images: true,
      },
      orderBy: {
        order: "asc",
      },
    });
  }
}

export const timelineRepository = new TimelineRepository();
