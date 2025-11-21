import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { noteService } from "@/services/note-service";
import { createNoteValidator } from "@/types/dtos/notes";
import { NextApiHandler } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const handler: NextApiHandler = async (req, res) => {
  const method = req.method?.toUpperCase() as HttpMethod;
  const { Ok, Created, NotAllowed, BadRequest, Unauthorized, InternalError } =
    Status(res);

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return Unauthorized();
  }

  try {
    switch (method) {
      case "GET": {
        const { eventId, expenseId, timelineItemId } = req.query;

        if (typeof eventId === "string") {
          const notes = await noteService.getNotesByEventId(eventId, userId);
          return Ok(notes);
        }

        if (typeof expenseId === "string") {
          const notes = await noteService.getNotesByExpenseId(
            expenseId,
            userId
          );
          return Ok(notes);
        }

        if (typeof timelineItemId === "string") {
          const notes = await noteService.getNotesByTimelineItemId(
            timelineItemId,
            userId
          );
          return Ok(notes);
        }

        return BadRequest(
          "ENTITY_ID_REQUIRED",
          "eventId, expenseId, or timelineItemId required"
        );
      }

      case "POST": {
        const validation = createNoteValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        const note = await noteService.createNote(validation.data, userId);
        return Created(note);
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Notes API error:", error);
    return InternalError(
      "NOTES_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
