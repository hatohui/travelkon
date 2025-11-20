import { HttpMethod } from "@/common/http";
import Status from "@/common/status";
import { env } from "@/config/env";
import { imageService } from "@/services/image-service";
import { signImageValidator } from "@/types/dtos/images";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const method = req.method?.toUpperCase() as HttpMethod;
  const { InternalError, NotAllowed, BadRequest, Ok } = Status(res);

  try {
    switch (method) {
      case "POST": {
        const body = req.body;

        const validation = await signImageValidator.safeParseAsync(body);
        if (!validation.success) return BadRequest("INVALID_FOLDER");

        const timestamp = Math.floor(Date.now() / 1000);
        const signature = imageService.getSignature(timestamp, body.folder);

        if (!signature) return InternalError("Could not generate signature");

        return Ok({
          signature,
          timestamp,
          apikey: env.cloudinaryApiKey,
          cloudName: env.cloudinaryCloudName,
          folder: body.folder,
        });
      }
      default:
        return NotAllowed();
    }
  } catch (error) {
    console.log(error);
    return InternalError();
  }
};

export default handler;
