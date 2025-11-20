import { prisma } from "@/common/prisma";

export class HealthRepository {
  /**
   * Check if the database connection is working
   * @returns Promise<boolean> - true if connected, false otherwise
   */
  async checkDatabaseConnection(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("[health-repository] Database connection failed:", error);
      return false;
    }
  }

  /**
   * Get database metadata
   * @returns Promise with connection info
   */
  async getDatabaseInfo(): Promise<{
    connected: boolean;
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      return {
        connected: true,
        responseTime,
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const healthRepository = new HealthRepository();
