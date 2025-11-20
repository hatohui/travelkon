import { prisma } from "@/common/prisma";
import type { Event, EventMember, Prisma } from "@prisma/client";

export class EventRepository {
  /**
   * Create a new event
   */
  async create(data: Prisma.EventCreateInput): Promise<Event> {
    return prisma.event.create({
      data,
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Find event by ID
   */
  async findById(id: string): Promise<Event | null> {
    return prisma.event.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        expenses: {
          include: {
            paidBy: true,
            splits: {
              include: {
                user: true,
              },
            },
          },
        },
        timeline: {
          include: {
            items: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
        images: true,
        notes: {
          include: {
            author: true,
          },
        },
      },
    });
  }

  /**
   * Find all events for a user
   */
  async findByUserId(userId: string): Promise<Event[]> {
    return prisma.event.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        startAt: "desc",
      },
    });
  }

  /**
   * Update an event
   */
  async update(id: string, data: Prisma.EventUpdateInput): Promise<Event> {
    return prisma.event.update({
      where: { id },
      data,
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Delete an event
   */
  async delete(id: string): Promise<Event> {
    return prisma.event.delete({
      where: { id },
    });
  }

  /**
   * Add member to event
   */
  async addMember(data: Prisma.EventMemberCreateInput): Promise<EventMember> {
    return prisma.eventMember.create({
      data,
      include: {
        user: true,
        event: true,
      },
    });
  }

  /**
   * Remove member from event
   */
  async removeMember(eventId: string, userId: string): Promise<EventMember> {
    return prisma.eventMember.delete({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    eventId: string,
    userId: string,
    role: "OWNER" | "ADMIN" | "MEMBER"
  ): Promise<EventMember> {
    return prisma.eventMember.update({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      data: {
        role,
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Check if user is member of event
   */
  async isMember(eventId: string, userId: string): Promise<boolean> {
    const member = await prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });
    return member !== null;
  }

  /**
   * Get member role
   */
  async getMemberRole(
    eventId: string,
    userId: string
  ): Promise<"OWNER" | "ADMIN" | "MEMBER" | null> {
    const member = await prisma.eventMember.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      select: {
        role: true,
      },
    });
    return member?.role ?? null;
  }
}

export const eventRepository = new EventRepository();
