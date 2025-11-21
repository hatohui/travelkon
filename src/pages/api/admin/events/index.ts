import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { eventService } from "@/services/event-service";
import { NextApiHandler } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { isAdmin } from "@/lib/auth";

const handler: NextApiHandler = async (req, res) => {
  const method = req.method?.toUpperCase() as HttpMethod;
  const { Ok, NotAllowed, Unauthorized, Forbidden, InternalError } =
    Status(res);

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return Unauthorized();
  }

  // Check if user is admin
  if (!isAdmin(session.user)) {
    return Forbidden("ADMIN_ONLY", "This endpoint requires admin privileges");
  }

  try {
    switch (method) {
      case "GET": {
        const events = await eventService.getAllEvents();
        return Ok(events);
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Admin Events API error:", error);
    return InternalError(
      "ADMIN_EVENTS_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
