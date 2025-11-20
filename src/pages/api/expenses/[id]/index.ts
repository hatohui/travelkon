import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { expenseService } from "@/services/expense-service";
import { updateExpenseValidator } from "@/types/dtos/expenses";
import { NextApiHandler } from "next";

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

  const userId = req.headers["x-user-id"] as string; // TODO: Replace with actual auth
  const { id } = req.query;

  if (!userId) {
    return Unauthorized();
  }

  if (typeof id !== "string") {
    return BadRequest("INVALID_EXPENSE_ID", "Invalid expense ID");
  }

  try {
    switch (method) {
      case "GET": {
        const expense = await expenseService.getExpenseById(id);
        if (!expense) {
          return NotFound("EXPENSE_NOT_FOUND", "Expense not found");
        }

        return Ok(expense);
      }

      case "PATCH": {
        const validation = updateExpenseValidator.safeParse(req.body);
        if (!validation.success) {
          return BadRequest(
            "VALIDATION_ERROR",
            validation.error.issues[0]?.message
          );
        }

        const expense = await expenseService.updateExpense(
          id,
          validation.data,
          userId
        );
        return Ok(expense);
      }

      case "DELETE": {
        await expenseService.deleteExpense(id, userId);
        return NoContent();
      }

      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("Expense API error:", error);
    return InternalError(
      "EXPENSE_ERROR",
      error instanceof Error ? error.message : "Internal server error"
    );
  }
};

export default handler;
