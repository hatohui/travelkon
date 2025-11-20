import cloudinary, { ImageFolder } from "@/common/cloudinary";
import { env } from "@/config/env";

export const imageService = {
  getSignature: (timeStamp: number, folder: ImageFolder) => {
    return cloudinary.utils.api_sign_request(
      {
        timeStamp,
        folder,
      },
      env.cloudinaryApiSecret
    );
  },
};
