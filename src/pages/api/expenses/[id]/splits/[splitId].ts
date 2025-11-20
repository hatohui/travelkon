import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { expenseService } from "@/services/expense-service";
import { markSplitSettledValidator } from "@/types/dtos/expenses";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const method = req.method?.toUpperCase() as HttpMethod;
  const { Ok, NotAllowed, BadRequest, Unauthorized, InternalError } =
    Status(res);

  const userId = req.headers["x-user-id"] as string; // TODO: Replace with actual auth
  const { id, splitId } = req.query;

  if (!userId) {
    return Unauthorized();
  }

  if (typeof id !== "string" || typeof splitId !== "string") {
    return BadRequest("INVALID_IDS", "Invalid expense or split ID");
  }

  try {
    switch (method) {
      case "PATCH": {
        const validation = markSplitSettledValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        const split = await expenseService.markSplitSettled(
          splitId,
          validation.data.settled,
          userId
        );
        return Ok(split);
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Expense split API error:", error);
    return InternalError(
      "SPLIT_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
