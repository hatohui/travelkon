import { Folders } from "@/common/cloudinary";
import z4 from "zod/v4";

// Sign images
export const signImageValidator = z4.object({
  folder: z4.enum(Object.values(Folders)),
});

export type SignImageRequest = z4.infer<typeof signImageValidator>;

export type SignImageResponse = {
  timeStamp: number;
  signature: string;
  apiKey: string;
  folder: string;
  cloudName: string;
};
