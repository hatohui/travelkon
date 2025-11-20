import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { noteService } from "@/services/note-service";
import { updateNoteValidator } from "@/types/dtos/notes";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const method = req.method?.toUpperCase() as HttpMethod;
  const {
    Ok,
    NoContent,
    NotAllowed,
    BadRequest,
    NotFound,
    Unauthorized,
    InternalError,
  } = Status(res);

  const userId = req.headers["x-user-id"] as string; // TODO: Replace with actual auth
  const { id } = req.query;

  if (!userId) {
    return Unauthorized();
  }

  if (typeof id !== "string") {
    return BadRequest("INVALID_NOTE_ID", "Invalid note ID");
  }

  try {
    switch (method) {
      case "GET": {
        const note = await noteService.getNoteById(id);
        if (!note) {
          return NotFound("NOTE_NOT_FOUND", "Note not found");
        }
        return Ok(note);
      }

      case "PATCH": {
        const validation = updateNoteValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        const note = await noteService.updateNote(id, validation.data, userId);
        return Ok(note);
      }

      case "DELETE": {
        await noteService.deleteNote(id, userId);
        return NoContent();
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Note API error:", error);
    return InternalError(
      "NOTE_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
