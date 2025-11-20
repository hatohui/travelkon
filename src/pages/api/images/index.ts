import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { imageService } from "@/services/note-service";
import { createImageValidator } from "@/types/dtos/notes";
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
        const { eventId, expenseId, timelineItemId } = req.query;

        if (typeof eventId === "string") {
          const images = await imageService.getImagesByEventId(eventId, userId);
          return Ok(images);
        }

        if (typeof expenseId === "string") {
          const images = await imageService.getImagesByExpenseId(
            expenseId,
            userId
          );
          return Ok(images);
        }

        if (typeof timelineItemId === "string") {
          const images = await imageService.getImagesByTimelineItemId(
            timelineItemId,
            userId
          );
          return Ok(images);
        }

        return BadRequest(
          "ENTITY_ID_REQUIRED",
          "eventId, expenseId, or timelineItemId required"
        );
      }

      case "POST": {
        const validation = createImageValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        const image = await imageService.createImage(validation.data, userId);
        return Created(image);
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Images API error:", error);
    return InternalError(
      "IMAGES_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
