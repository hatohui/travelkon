import { v2 } from "cloudinary";
import { env } from "../config/env";

v2.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

export enum Folders {
  expenses = "expenses",
  profiles = "profiles",
  trips = "trips",
}
const cloudinary = v2;

export default cloudinary;
export type ImageFolder = keyof typeof Folders;
