const loadEnv = () => {
  const envObj = {
    databaseUrl: process.env.DATABASE_URL || "",
    cloudinaryUrl: process.env.CLOUDINARY_URL || "",
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
    cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
  };

  const missing = Object.entries(envObj)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length === 0) {
    console.info("[env] environment variables loaded");
  } else {
    console.warn("[env] environment variables missing:", missing.join(", "));
  }

  return envObj;
};

export const env = loadEnv();
