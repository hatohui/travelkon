import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { expenseService } from "@/services/expense-service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const method = req.method?.toUpperCase() as HttpMethod;
  const { Ok, NotAllowed, BadRequest, Unauthorized, InternalError } =
    Status(res);

  const userId = req.headers["x-user-id"] as string; // TODO: Replace with actual auth
  const { eventId } = req.query;

  if (!userId) {
    return Unauthorized();
  }

  if (typeof eventId !== "string") {
    return BadRequest("EVENT_ID_REQUIRED", "Event ID required");
  }

  try {
    switch (method) {
      case "GET": {
        const settlements = await expenseService.calculateSettlements(eventId);
        return Ok(settlements);
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Settlements API error:", error);
    return InternalError(
      "SETTLEMENTS_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
