import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { eventService } from "@/services/event-service";
import { NextApiHandler } from "next";
import { z } from "zod";

const inviteMemberValidator = z.object({
  email: z.string().email(),
});

const handler: NextApiHandler = async (req, res) => {
  const method = req.method?.toUpperCase() as HttpMethod;
  const { Created, NotAllowed, BadRequest, Unauthorized, InternalError } =
    Status(res);

  const userId = req.headers["x-user-id"] as string; // TODO: Replace with actual auth
  const { id } = req.query;

  if (!userId) {
    return Unauthorized();
  }

  if (typeof id !== "string") {
    return BadRequest("INVALID_EVENT_ID", "Invalid event ID");
  }

  try {
    if (method !== "POST") {
      return NotAllowed();
    }

    const validation = inviteMemberValidator.safeParse(req.body);
    if (!validation.success) {
      return BadRequest(
        "VALIDATION_ERROR",
        validation.error.issues[0]?.message
      );
    }

    const invitation = await eventService.inviteMemberByEmail(
      id,
      validation.data.email,
      userId
    );
    return Created(invitation);
  } catch (error) {
    console.error("Event invite API error:", error);
    return InternalError(
      "INVITE_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
