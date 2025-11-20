import {
  noteRepository,
  imageRepository,
} from "@/repositories/note-repository";
import { eventRepository } from "@/repositories/event-repository";
import { expenseRepository } from "@/repositories/expense-repository";
import { timelineRepository } from "@/repositories/timeline-repository";
import type {
  CreateNoteDto,
  UpdateNoteDto,
  CreateImageDto,
  UpdateImageDto,
} from "@/types/dtos/notes";

export class NoteService {
  /**
   * Create a note
   */
  async createNote(data: CreateNoteDto, userId: string) {
    // Verify access to parent entity
    if (data.eventId) {
      const isMember = await eventRepository.isMember(data.eventId, userId);
      if (!isMember) {
        throw new Error("User is not a member of this event");
      }
    } else if (data.expenseId) {
      const expense = await expenseRepository.findById(data.expenseId);
      if (!expense) {
        throw new Error("Expense not found");
      }
      const isMember = await eventRepository.isMember(expense.eventId, userId);
      if (!isMember) {
        throw new Error("User is not a member of this event");
      }
    } else if (data.timelineItemId) {
      const item = await timelineRepository.findItemById(data.timelineItemId);
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
    }

    return noteRepository.create({
      content: data.content,
      author: { connect: { id: data.authorId } },
      event: data.eventId ? { connect: { id: data.eventId } } : undefined,
      expense: data.expenseId ? { connect: { id: data.expenseId } } : undefined,
      timelineItem: data.timelineItemId
        ? { connect: { id: data.timelineItemId } }
        : undefined,
    });
  }

  /**
   * Get note by ID
   */
  async getNoteById(noteId: string) {
    return noteRepository.findById(noteId);
  }

  /**
   * Get notes by event ID
   */
  async getNotesByEventId(eventId: string, userId: string) {
    const isMember = await eventRepository.isMember(eventId, userId);
    if (!isMember) {
      throw new Error("User is not a member of this event");
    }
    return noteRepository.findByEventId(eventId);
  }

  /**
   * Get notes by expense ID
   */
  async getNotesByExpenseId(expenseId: string, userId: string) {
    const expense = await expenseRepository.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }
    const isMember = await eventRepository.isMember(expense.eventId, userId);
    if (!isMember) {
      throw new Error("User is not a member of this event");
    }
    return noteRepository.findByExpenseId(expenseId);
  }

  /**
   * Get notes by timeline item ID
   */
  async getNotesByTimelineItemId(timelineItemId: string, userId: string) {
    const item = await timelineRepository.findItemById(timelineItemId);
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
    return noteRepository.findByTimelineItemId(timelineItemId);
  }

  /**
   * Get notes for an entity
   */
  async getNotes(
    entityType: "event" | "expense" | "timelineItem",
    entityId: string,
    userId: string
  ) {
    // Verify access
    if (entityType === "event") {
      const isMember = await eventRepository.isMember(entityId, userId);
      if (!isMember) {
        throw new Error("User is not a member of this event");
      }
      return noteRepository.findByEventId(entityId);
    } else if (entityType === "expense") {
      const expense = await expenseRepository.findById(entityId);
      if (!expense) {
        throw new Error("Expense not found");
      }
      const isMember = await eventRepository.isMember(expense.eventId, userId);
      if (!isMember) {
        throw new Error("User is not a member of this event");
      }
      return noteRepository.findByExpenseId(entityId);
    } else if (entityType === "timelineItem") {
      const item = await timelineRepository.findItemById(entityId);
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
      return noteRepository.findByTimelineItemId(entityId);
    }

    return [];
  }

  /**
   * Update note
   */
  async updateNote(noteId: string, data: UpdateNoteDto, userId: string) {
    const note = await noteRepository.findById(noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    // Only author can update
    if (note.authorId !== userId) {
      throw new Error("Only note author can update it");
    }

    return noteRepository.update(noteId, { content: data.content });
  }

  /**
   * Delete note
   */
  async deleteNote(noteId: string, userId: string) {
    const note = await noteRepository.findById(noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    // Author or event admin can delete
    if (note.authorId !== userId) {
      if (note.eventId) {
        const role = await eventRepository.getMemberRole(note.eventId, userId);
        if (role !== "OWNER" && role !== "ADMIN") {
          throw new Error("Insufficient permissions");
        }
      } else {
        throw new Error("Insufficient permissions");
      }
    }

    return noteRepository.delete(noteId);
  }
}

export class ImageService {
  /**
   * Create image record after upload
   */
  async createImage(data: CreateImageDto, userId: string) {
    // Verify access to parent entity
    if (data.eventId) {
      const isMember = await eventRepository.isMember(data.eventId, userId);
      if (!isMember) {
        throw new Error("User is not a member of this event");
      }
    } else if (data.expenseId) {
      const expense = await expenseRepository.findById(data.expenseId);
      if (!expense) {
        throw new Error("Expense not found");
      }
      const isMember = await eventRepository.isMember(expense.eventId, userId);
      if (!isMember) {
        throw new Error("User is not a member of this event");
      }
    } else if (data.timelineItemId) {
      const item = await timelineRepository.findItemById(data.timelineItemId);
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
    }

    return imageRepository.create({
      url: data.url,
      publicId: data.publicId,
      uploadedBy: { connect: { id: data.uploadedById } },
      event: data.eventId ? { connect: { id: data.eventId } } : undefined,
      expense: data.expenseId ? { connect: { id: data.expenseId } } : undefined,
      timelineItem: data.timelineItemId
        ? { connect: { id: data.timelineItemId } }
        : undefined,
      caption: data.caption,
    });
  }

  /**
   * Get images for an entity
   */
  async getImages(
    entityType: "event" | "expense" | "timelineItem",
    entityId: string,
    userId: string
  ) {
    // Verify access
    if (entityType === "event") {
      const isMember = await eventRepository.isMember(entityId, userId);
      if (!isMember) {
        throw new Error("User is not a member of this event");
      }
      return imageRepository.findByEventId(entityId);
    } else if (entityType === "expense") {
      const expense = await expenseRepository.findById(entityId);
      if (!expense) {
        throw new Error("Expense not found");
      }
      const isMember = await eventRepository.isMember(expense.eventId, userId);
      if (!isMember) {
        throw new Error("User is not a member of this event");
      }
      return imageRepository.findByExpenseId(entityId);
    } else if (entityType === "timelineItem") {
      const item = await timelineRepository.findItemById(entityId);
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
      return imageRepository.findByTimelineItemId(entityId);
    }

    return [];
  }

  /**
   * Get image by ID
   */
  async getImageById(imageId: string, userId: string) {
    const image = await imageRepository.findById(imageId);
    if (!image) {
      return null;
    }

    // Verify access to parent event
    if (image.eventId) {
      const isMember = await eventRepository.isMember(image.eventId, userId);
      if (!isMember) {
        throw new Error("User is not a member of this event");
      }
    }

    return image;
  }

  /**
   * Get images by event ID
   */
  async getImagesByEventId(eventId: string, userId: string) {
    const isMember = await eventRepository.isMember(eventId, userId);
    if (!isMember) {
      throw new Error("User is not a member of this event");
    }
    return imageRepository.findByEventId(eventId);
  }

  /**
   * Get images by expense ID
   */
  async getImagesByExpenseId(expenseId: string, userId: string) {
    const expense = await expenseRepository.findById(expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }
    const isMember = await eventRepository.isMember(expense.eventId, userId);
    if (!isMember) {
      throw new Error("User is not a member of this event");
    }
    return imageRepository.findByExpenseId(expenseId);
  }

  /**
   * Get images by timeline item ID
   */
  async getImagesByTimelineItemId(timelineItemId: string, userId: string) {
    const item = await timelineRepository.findItemById(timelineItemId);
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
    return imageRepository.findByTimelineItemId(timelineItemId);
  }

  /**
   * Update image
   */
  async updateImage(imageId: string, data: UpdateImageDto, userId: string) {
    const image = await imageRepository.findById(imageId);
    if (!image) {
      throw new Error("Image not found");
    }

    // Only uploader can update
    if (image.uploadedById !== userId) {
      throw new Error("Only image uploader can update it");
    }

    return imageRepository.update(imageId, { caption: data.caption });
  }

  /**
   * Delete image
   */
  async deleteImage(imageId: string, userId: string) {
    const image = await imageRepository.findById(imageId);
    if (!image) {
      throw new Error("Image not found");
    }

    // Uploader or event admin can delete
    if (image.uploadedById !== userId) {
      if (image.eventId) {
        const role = await eventRepository.getMemberRole(image.eventId, userId);
        if (role !== "OWNER" && role !== "ADMIN") {
          throw new Error("Insufficient permissions");
        }
      } else {
        throw new Error("Insufficient permissions");
      }
    }

    return imageRepository.delete(imageId);
  }
}

export const noteService = new NoteService();
export const imageService = new ImageService();
