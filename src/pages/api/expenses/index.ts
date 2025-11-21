import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { expenseService } from "@/services/expense-service";
import { createExpenseValidator } from "@/types/dtos/expenses";
import { NextApiHandler } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const handler: NextApiHandler = async (req, res) => {
  const method = req.method?.toUpperCase() as HttpMethod;
  const { Ok, Created, NotAllowed, BadRequest, Unauthorized, InternalError } =
    Status(res);

  const session = await getServerSession(req, res, authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return Unauthorized();
  }

  try {
    switch (method) {
      case "GET": {
        const { eventId } = req.query;

        if (typeof eventId === "string") {
          const expenses = await expenseService.getEventExpenses(eventId);
          return Ok(expenses);
        }

        return BadRequest("EVENT_ID_REQUIRED", "Event ID required");
      }

      case "POST": {
        const validation = createExpenseValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        const expense = await expenseService.createExpense(
          validation.data,
          userId
        );
        return Created(expense);
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Expenses API error:", error);
    return InternalError(
      "EXPENSES_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
