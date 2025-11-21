import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { timelineService } from "@/services/timeline-service";
import {
  createTimelineItemValidator,
  reorderTimelineItemsValidator,
} from "@/types/dtos/timeline";
import { NextApiHandler } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const handler: NextApiHandler = async (req, res) => {
  const method = req.method?.toUpperCase() as HttpMethod;
  const { Ok, Created, NotAllowed, BadRequest, Unauthorized, InternalError } =
    Status(res);

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;
  const { id } = req.query;

  if (!userId) {
    return Unauthorized();
  }

  if (typeof id !== "string") {
    return BadRequest("INVALID_TIMELINE_ID", "Invalid timeline ID");
  }

  try {
    switch (method) {
      case "GET": {
        const items = await timelineService.getTimelineItems(id, userId);
        return Ok(items);
      }

      case "POST": {
        const validation = createTimelineItemValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        const item = await timelineService.createTimelineItem(
          validation.data,
          userId
        );
        return Created(item);
      }

      case "PATCH": {
        const validation = reorderTimelineItemsValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        await timelineService.reorderTimelineItems(id, validation.data, userId);
        return Ok({ success: true });
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Timeline items API error:", error);
    return InternalError(
      "TIMELINE_ITEMS_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
