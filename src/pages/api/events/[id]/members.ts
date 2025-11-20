import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { eventService } from "@/services/event-service";
import { NextApiHandler } from "next";
import { z } from "zod";

const addMemberValidator = z.object({
  userId: z.string().uuid(),
  role: z.enum(["MEMBER", "ADMIN"]).default("MEMBER"),
});

const updateMemberValidator = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

const handler: NextApiHandler = async (req, res) => {
  const method = req.method?.toUpperCase() as HttpMethod;
  const {
    Ok,
    Created,
    NoContent,
    NotAllowed,
    BadRequest,
    Unauthorized,
    InternalError,
  } = Status(res);

  const userId = req.headers["x-user-id"] as string; // TODO: Replace with actual auth
  const { id } = req.query;

  if (!userId) {
    return Unauthorized();
  }

  if (typeof id !== "string") {
    return BadRequest("INVALID_EVENT_ID", "Invalid event ID");
  }

  try {
    switch (method) {
      case "POST": {
        const validation = addMemberValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        const member = await eventService.addMember(
          id,
          validation.data.userId,
          userId,
          validation.data.role
        );
        return Created(member);
      }

      case "DELETE": {
        const { userId: memberToRemove } = req.query;
        if (typeof memberToRemove !== "string") {
          return BadRequest("INVALID_USER_ID", "Invalid user ID");
        }

        await eventService.removeMember(id, memberToRemove, userId);
        return NoContent();
      }

      case "PATCH": {
        const { userId: memberToUpdate } = req.query;
        if (typeof memberToUpdate !== "string") {
          return BadRequest("INVALID_USER_ID", "Invalid user ID");
        }

        const validation = updateMemberValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        const member = await eventService.updateMemberRole(
          id,
          memberToUpdate,
          validation.data.role,
          userId
        );
        return Ok(member);
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Event members API error:", error);
    return InternalError(
      "MEMBERS_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
