import { eventRepository } from "@/repositories/event-repository";
import type { CreateEventDto, UpdateEventDto } from "@/types/dtos/events";

export class EventService {
  /**
   * Create a new event with the creator as owner
   */
  async createEvent(data: CreateEventDto, creatorUserId: string) {
    const event = await eventRepository.create({
      name: data.name,
      description: data.description,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      coverImage: data.coverImage,
      members: {
        create: {
          userId: creatorUserId,
          role: "OWNER",
        },
      },
    });

    return event;
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string) {
    return eventRepository.findById(eventId);
  }

  /**
   * Get all events for a user
   */
  async getUserEvents(userId: string) {
    return eventRepository.findByUserId(userId);
  }

  /**
   * Update event
   */
  async updateEvent(eventId: string, data: UpdateEventDto, userId: string) {
    // Check permissions
    const role = await eventRepository.getMemberRole(eventId, userId);
    if (!role || (role !== "OWNER" && role !== "ADMIN")) {
      throw new Error("Insufficient permissions");
    }

    const updateData: Partial<{
      name: string;
      description: string | null;
      startAt: Date;
      endAt: Date;
      coverImage: string | null;
    }> = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.startAt) updateData.startAt = new Date(data.startAt);
    if (data.endAt) updateData.endAt = new Date(data.endAt);
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;

    return eventRepository.update(eventId, updateData);
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string, userId: string) {
    // Only owners can delete
    const role = await eventRepository.getMemberRole(eventId, userId);
    if (role !== "OWNER") {
      throw new Error("Only event owner can delete the event");
    }

    return eventRepository.delete(eventId);
  }

  /**
   * Add member to event
   */
  async addMember(
    eventId: string,
    userId: string,
    requesterId: string,
    role: "MEMBER" | "ADMIN" = "MEMBER"
  ) {
    // Check permissions
    const requesterRole = await eventRepository.getMemberRole(
      eventId,
      requesterId
    );
    if (
      !requesterRole ||
      (requesterRole !== "OWNER" && requesterRole !== "ADMIN")
    ) {
      throw new Error("Insufficient permissions");
    }

    return eventRepository.addMember({
      event: { connect: { id: eventId } },
      user: { connect: { id: userId } },
      role,
    });
  }

  /**
   * Remove member from event
   */
  async removeMember(eventId: string, userId: string, requesterId: string) {
    const requesterRole = await eventRepository.getMemberRole(
      eventId,
      requesterId
    );

    // Members can remove themselves
    if (userId === requesterId) {
      // Owner can't leave their own event
      if (requesterRole === "OWNER") {
        throw new Error("Owner cannot leave the event");
      }
      return eventRepository.removeMember(eventId, userId);
    }

    // Only admins and owners can remove others
    if (
      !requesterRole ||
      (requesterRole !== "OWNER" && requesterRole !== "ADMIN")
    ) {
      throw new Error("Insufficient permissions");
    }

    return eventRepository.removeMember(eventId, userId);
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    eventId: string,
    userId: string,
    newRole: "OWNER" | "ADMIN" | "MEMBER",
    requesterId: string
  ) {
    // Only owner can change roles
    const requesterRole = await eventRepository.getMemberRole(
      eventId,
      requesterId
    );
    if (requesterRole !== "OWNER") {
      throw new Error("Only owner can change member roles");
    }

    return eventRepository.updateMemberRole(eventId, userId, newRole);
  }

  /**
   * Check if user has access to event
   */
  async checkAccess(eventId: string, userId: string): Promise<boolean> {
    return eventRepository.isMember(eventId, userId);
  }

  /**
   * Invite member by email
   * If user doesn't exist, they'll need to register with this email to join
   */
  async inviteMemberByEmail(
    eventId: string,
    email: string,
    requesterId: string
  ) {
    // Check permissions
    const requesterRole = await eventRepository.getMemberRole(
      eventId,
      requesterId
    );
    if (
      !requesterRole ||
      (requesterRole !== "OWNER" && requesterRole !== "ADMIN")
    ) {
      throw new Error("Insufficient permissions");
    }

    // Find user by email
    const user = await eventRepository.findUserByEmail(email);

    if (!user) {
      // User doesn't exist yet - create a pending invitation record
      // For now, we'll return a message indicating they need to register
      return {
        success: true,
        message: "Invitation sent. User must register with this email to join.",
        email,
        userExists: false,
      };
    }

    // Check if user is already a member
    const isMember = await eventRepository.isMember(eventId, user.id);
    if (isMember) {
      throw new Error("User is already a member of this event");
    }

    // Add user as member
    await eventRepository.addMember({
      event: { connect: { id: eventId } },
      user: { connect: { id: user.id } },
      role: "MEMBER",
    });

    return {
      success: true,
      message: "User added to event successfully",
      email,
      userExists: true,
      userId: user.id,
    };
  }
}

export const eventService = new EventService();
