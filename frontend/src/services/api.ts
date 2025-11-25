import type { InsightData, WeatherLog } from "@/types/weather";
import { UsersService } from "./users";

const API_BASE_URL = "http://localhost:3000";

function createAbortController(timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return { controller, timer };
}

export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  token?: string | null,
  body?: unknown,
  customHeaders?: Record<string, string>
): Promise<T> {
  const { controller, timer } = createAbortController();
  const signal = controller.signal;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      signal,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (response.status === 401) {
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Erro (${response.status})`);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T; 
    }

    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function getWeatherLogs(
  token: string | null
): Promise<WeatherLog[]> {
  return apiRequest("/weather-logs", "GET", token);
}


export async function getInsights(
  token: string | null
): Promise<InsightData> {
  return apiRequest("/insights", "GET", token);
}

export async function exportLogs(
  token: string | null,
  format: "csv" | "xlsx"
) {
  if (!token) throw new Error("Unauthorized");

  const response = await fetch(
    `${API_BASE_URL}/weather-logs/export-${format}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) throw new Error("Unauthorized");
  if (!response.ok) throw new Error(`Erro ao exportar (${response.status})`);

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition");

  let filename = `weather-logs.${format}`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match) filename = match[1];
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  return true;
}

export const SpaceXService = {
  async getLaunches(
    token: string,
    page: number = 1,
    limit: number = 10
  ) {
    return apiRequest(
      `/external-data/spacex/launches?page=${page}&limit=${limit}`,
      "GET",
      token
    );
  },
};

export const API = {
  getWeatherLogs,
  getInsights,
  exportLogs,
  SpaceX: SpaceXService,
  Users: UsersService,
};
