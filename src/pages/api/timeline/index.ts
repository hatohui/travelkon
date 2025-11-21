import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { timelineService } from "@/services/timeline-service";
import { createTimelineValidator } from "@/types/dtos/timeline";
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
        const { eventId } = req.query;

        if (typeof eventId !== "string") {
          return BadRequest("EVENT_ID_REQUIRED", "Event ID required");
        }

        const timeline = await timelineService.getOrCreateTimeline(
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

        const timeline = await timelineService.getOrCreateTimeline(
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
