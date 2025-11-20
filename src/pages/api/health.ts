import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { healthService } from "@/services/health-service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const method = req.method?.toUpperCase() as HttpMethod;
  const { InternalError, NotAllowed, Ok } = Status(res);

  try {
    switch (method) {
      case "GET": {
        const healthCheck = await healthService.performHealthCheck();
        return Ok(healthCheck);
      }
      default:
        return NotAllowed();
    }
  } catch (error) {
    console.error("[health] Health check failed:", error);
    return InternalError();
  }
};

export default handler;
