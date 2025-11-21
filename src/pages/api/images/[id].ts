import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { imageService } from "@/services/note-service";
import { updateImageValidator } from "@/types/dtos/notes";
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
    return BadRequest("INVALID_IMAGE_ID", "Invalid image ID");
  }

  try {
    switch (method) {
      case "GET": {
        const image = await imageService.getImageById(id, userId);
        if (!image) {
          return NotFound("IMAGE_NOT_FOUND", "Image not found");
        }
        return Ok(image);
      }

      case "PATCH": {
        const validation = updateImageValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        const image = await imageService.updateImage(
          id,
          validation.data,
          userId
        );
        return Ok(image);
      }

      case "DELETE": {
        await imageService.deleteImage(id, userId);
        return NoContent();
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Image API error:", error);
    return InternalError(
      "IMAGE_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
