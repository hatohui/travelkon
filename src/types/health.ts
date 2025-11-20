export type EnvCheckResult = {
  name: string;
  status: "ok" | "missing";
  value?: string;
};

export type EndpointCheckResult = {
  path: string;
  status: "ok" | "error";
  responseTime?: number;
  error?: string;
};

export type DatabaseCheckResult = {
  status: "ok" | "error";
  connected: boolean;
  responseTime?: number;
  error?: string;
};

export type HealthCheckResponse = {
  timestamp: string;
  environment: {
    status: "ok" | "warning";
    checks: EnvCheckResult[];
  };
  database: DatabaseCheckResult;
  endpoints: {
    status: "ok" | "error";
    checks: EndpointCheckResult[];
  };
  overall: "healthy" | "degraded" | "unhealthy";
};
