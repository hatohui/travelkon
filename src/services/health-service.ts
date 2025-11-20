import { env } from "@/config/env";
import { healthRepository } from "@/repositories/health-repository";
import type {
  EnvCheckResult,
  EndpointCheckResult,
  DatabaseCheckResult,
  HealthCheckResponse,
} from "@/types/health";

class HealthService {
  /**
   * Check environment variables
   */
  checkEnvironmentVariables(): EnvCheckResult[] {
    const envChecks: EnvCheckResult[] = [
      {
        name: "DATABASE_URL",
        status: env.databaseUrl ? "ok" : "missing",
        value: env.databaseUrl ? "***configured***" : undefined,
      },
      {
        name: "CLOUDINARY_URL",
        status: env.cloudinaryUrl ? "ok" : "missing",
        value: env.cloudinaryUrl ? "***configured***" : undefined,
      },
      {
        name: "CLOUDINARY_API_KEY",
        status: env.cloudinaryApiKey ? "ok" : "missing",
        value: env.cloudinaryApiKey ? "***configured***" : undefined,
      },
      {
        name: "CLOUDINARY_API_SECRET",
        status: env.cloudinaryApiSecret ? "ok" : "missing",
        value: env.cloudinaryApiSecret ? "***configured***" : undefined,
      },
      {
        name: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
        status: env.cloudinaryCloudName ? "ok" : "missing",
        value: env.cloudinaryCloudName || undefined,
      },
    ];

    return envChecks;
  }

  /**
   * Check database connectivity
   */
  async checkDatabase(): Promise<DatabaseCheckResult> {
    const dbInfo = await healthRepository.getDatabaseInfo();

    return {
      status: dbInfo.connected ? "ok" : "error",
      connected: dbInfo.connected,
      responseTime: dbInfo.responseTime,
      error: dbInfo.error,
    };
  }

  /**
   * Check API endpoints availability
   */
  async checkEndpoints(): Promise<EndpointCheckResult[]> {
    const endpoints = ["/api/images/sign"];
    const results: EndpointCheckResult[] = [];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        const baseUrl = process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000";

        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: "OPTIONS",
        });

        const responseTime = Date.now() - startTime;

        results.push({
          path: endpoint,
          status: response.status !== 404 ? "ok" : "error",
          responseTime,
        });
      } catch (error) {
        results.push({
          path: endpoint,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  /**
   * Perform complete health check
   */
  async performHealthCheck(): Promise<HealthCheckResponse> {
    const envChecks = this.checkEnvironmentVariables();
    const dbCheck = await this.checkDatabase();
    const endpointChecks = await this.checkEndpoints();

    const envStatus = envChecks.every((check) => check.status === "ok")
      ? "ok"
      : "warning";
    const endpointsStatus = endpointChecks.every(
      (check) => check.status === "ok"
    )
      ? "ok"
      : "error";

    let overall: "healthy" | "degraded" | "unhealthy";
    if (dbCheck.status === "error") {
      overall = "unhealthy";
    } else if (envStatus === "warning" || endpointsStatus === "error") {
      overall = "degraded";
    } else {
      overall = "healthy";
    }

    return {
      timestamp: new Date().toISOString(),
      environment: {
        status: envStatus,
        checks: envChecks,
      },
      database: dbCheck,
      endpoints: {
        status: endpointsStatus,
        checks: endpointChecks,
      },
      overall,
    };
  }
}

export const healthService = new HealthService();
