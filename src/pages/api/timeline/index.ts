import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { timelineService } from "@/services/timeline-service";
import { createTimelineValidator } from "@/types/dtos/timeline";
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
        const { eventId } = req.query;

        if (typeof eventId !== "string") {
          return BadRequest("EVENT_ID_REQUIRED", "Event ID required");
        }

        const timeline = await timelineService.getTimelineByEventId(
          eventId,
          userId
        );
        return Ok(timeline);
      }

      case "POST": {
        const validation = createTimelineValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        const timeline = await timelineService.createTimeline(
          validation.data.eventId,
          userId
        );
        return Created(timeline);
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Timeline API error:", error);
    return InternalError(
      "TIMELINE_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
