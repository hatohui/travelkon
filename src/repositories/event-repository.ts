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

  /**
   * Find user by email
   */
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });
  }

  /**
   * Get all events with full details (admin)
   */
  async findAll() {
    return prisma.event.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        expenses: {
          select: {
            id: true,
            amount: true,
            currency: true,
            title: true,
          },
        },
        _count: {
          select: {
            expenses: true,
            images: true,
            notes: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Get event statistics
   */
  async getStatistics() {
    const [
      totalEvents,
      totalUsers,
      totalExpenses,
      totalMembers,
      recentEvents,
      expenseStats,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.user.count(),
      prisma.expense.count(),
      prisma.eventMember.count(),
      prisma.event.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              expenses: true,
              members: true,
            },
          },
        },
      }),
      prisma.expense.aggregate({
        _sum: {
          amount: true,
        },
        _avg: {
          amount: true,
        },
      }),
    ]);

    return {
      totalEvents,
      totalUsers,
      totalExpenses,
      totalMembers,
      totalExpenseAmount: expenseStats._sum.amount ?? 0,
      avgExpenseAmount: expenseStats._avg.amount ?? 0,
      recentEvents,
    };
  }
}

export const eventRepository = new EventRepository();
