import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { eventService } from "@/services/event-service";
import { createEventValidator } from "@/types/dtos/events";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const method = req.method?.toUpperCase() as HttpMethod;
  const { Ok, Created, NotAllowed, BadRequest, Unauthorized, InternalError } =
    Status(res);

  const userId = req.headers["x-user-id"] as string; // TODO: Replace with actual auth

  if (!userId) {
    return Unauthorized();
  }

  try {
    switch (method) {
      case "GET": {
        const events = await eventService.getUserEvents(userId);
        return Ok(events);
      }

      case "POST": {
        const validation = createEventValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        const event = await eventService.createEvent(validation.data, userId);
        return Created(event);
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Events API error:", error);
    return InternalError(
      "EVENTS_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
