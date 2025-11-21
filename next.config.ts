import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["next-auth", "@next-auth/prisma-adapter"],
};

export default nextConfig;
