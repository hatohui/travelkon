import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { eventService } from "@/services/event-service";
import { updateEventValidator } from "@/types/dtos/events";
import { NextApiHandler } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const handler: NextApiHandler = async (req, res) => {
  const method = req.method?.toUpperCase() as HttpMethod;
  const {
    Ok,
    NoContent,
    NotAllowed,
    BadRequest,
    NotFound,
    Forbidden,
    Unauthorized,
    InternalError,
  } = Status(res);

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  const { id } = req.query;

  if (!userId) {
    return Unauthorized();
  }

  if (typeof id !== "string") {
    return BadRequest("INVALID_EVENT_ID", "Invalid event ID");
  }

  try {
    switch (method) {
      case "GET": {
        const hasAccess = await eventService.checkAccess(id, userId);
        if (!hasAccess) {
          return Forbidden("ACCESS_DENIED", "Access denied");
        }

        const event = await eventService.getEventById(id);
        if (!event) {
          return NotFound("EVENT_NOT_FOUND", "Event not found");
        }

        return Ok(event);
      }

      case "PATCH": {
        const validation = updateEventValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        const event = await eventService.updateEvent(
          id,
          validation.data,
          userId
        );
        return Ok(event);
      }

      case "DELETE": {
        await eventService.deleteEvent(id, userId);
        return NoContent();
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Event API error:", error);
    return InternalError(
      "EVENT_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
