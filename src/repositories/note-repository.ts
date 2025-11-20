import { prisma } from "@/common/prisma";
import type { Note, Image, Prisma } from "@prisma/client";

export class NoteRepository {
  /**
   * Create a new note
   */
  async create(data: Prisma.NoteCreateInput): Promise<Note> {
    return prisma.note.create({
      data,
      include: {
        author: true,
      },
    });
  }

  /**
   * Find note by ID
   */
  async findById(id: string): Promise<Note | null> {
    return prisma.note.findUnique({
      where: { id },
      include: {
        author: true,
        event: true,
        expense: true,
        timelineItem: true,
      },
    });
  }

  /**
   * Find notes by event
   */
  async findByEventId(eventId: string): Promise<Note[]> {
    return prisma.note.findMany({
      where: { eventId },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Find notes by expense
   */
  async findByExpenseId(expenseId: string): Promise<Note[]> {
    return prisma.note.findMany({
      where: { expenseId },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Find notes by timeline item
   */
  async findByTimelineItemId(timelineItemId: string): Promise<Note[]> {
    return prisma.note.findMany({
      where: { timelineItemId },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Update note
   */
  async update(id: string, data: Prisma.NoteUpdateInput): Promise<Note> {
    return prisma.note.update({
      where: { id },
      data,
      include: {
        author: true,
      },
    });
  }

  /**
   * Delete note
   */
  async delete(id: string): Promise<Note> {
    return prisma.note.delete({
      where: { id },
    });
  }
}

export class ImageRepository {
  /**
   * Create a new image record
   */
  async create(data: Prisma.ImageCreateInput): Promise<Image> {
    return prisma.image.create({
      data,
      include: {
        uploadedBy: true,
      },
    });
  }

  /**
   * Find image by ID
   */
  async findById(id: string): Promise<Image | null> {
    return prisma.image.findUnique({
      where: { id },
      include: {
        uploadedBy: true,
        event: true,
        expense: true,
        timelineItem: true,
      },
    });
  }

  /**
   * Find images by event
   */
  async findByEventId(eventId: string): Promise<Image[]> {
    return prisma.image.findMany({
      where: { eventId },
      include: {
        uploadedBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Find images by expense
   */
  async findByExpenseId(expenseId: string): Promise<Image[]> {
    return prisma.image.findMany({
      where: { expenseId },
      include: {
        uploadedBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Find images by timeline item
   */
  async findByTimelineItemId(timelineItemId: string): Promise<Image[]> {
    return prisma.image.findMany({
      where: { timelineItemId },
      include: {
        uploadedBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Update image
   */
  async update(id: string, data: Prisma.ImageUpdateInput): Promise<Image> {
    return prisma.image.update({
      where: { id },
      data,
      include: {
        uploadedBy: true,
      },
    });
  }

  /**
   * Delete image
   */
  async delete(id: string): Promise<Image> {
    return prisma.image.delete({
      where: { id },
    });
  }
}

export const noteRepository = new NoteRepository();
export const imageRepository = new ImageRepository();
