import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { eventService } from "@/services/event-service";
import { NextApiHandler } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const handler: NextApiHandler = async (req, res) => {
  const method = req.method?.toUpperCase() as HttpMethod;
  const { Ok, NotAllowed, BadRequest, Unauthorized, InternalError, NotFound } =
    Status(res);

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
    if (method !== "POST") {
      return NotAllowed();
    }

    // Check if event exists
    const event = await eventService.getEventById(id);
    if (!event) {
      return NotFound("EVENT_NOT_FOUND", "Event not found");
    }

    // Check if user is already a member
    const isMember = await eventService.checkAccess(id, userId);
    if (isMember) {
      return BadRequest(
        "ALREADY_MEMBER",
        "You are already a member of this event"
      );
    }

    // Add user as member
    await eventService.addMember(id, userId, userId, "MEMBER");

    return Ok({
      success: true,
      message: "Successfully joined the event",
      event: {
        id: event.id,
        name: event.name,
      },
    });
  } catch (error) {
    console.error("Event accept invite API error:", error);
    return InternalError(
      "ACCEPT_INVITE_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
