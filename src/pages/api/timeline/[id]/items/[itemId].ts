import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { timelineService } from "@/services/timeline-service";
import { updateTimelineItemValidator } from "@/types/dtos/timeline";
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
  const { id, itemId } = req.query;

  if (!userId) {
    return Unauthorized();
  }

  if (typeof id !== "string" || typeof itemId !== "string") {
    return BadRequest("INVALID_IDS", "Invalid timeline or item ID");
  }

  try {
    switch (method) {
      case "GET": {
        const item = await timelineService.getTimelineItemById(itemId, userId);
        if (!item) {
          return NotFound("ITEM_NOT_FOUND", "Timeline item not found");
        }
        return Ok(item);
      }

      case "PATCH": {
        const validation = updateTimelineItemValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        const item = await timelineService.updateTimelineItem(
          itemId,
          validation.data,
          userId
        );
        return Ok(item);
      }

      case "DELETE": {
        await timelineService.deleteTimelineItem(itemId, userId);
        return NoContent();
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Timeline item API error:", error);
    return InternalError(
      "TIMELINE_ITEM_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
