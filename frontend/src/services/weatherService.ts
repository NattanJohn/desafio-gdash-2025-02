// src/services/weatherService.ts
import type { InsightData, WeatherLog } from "@/types/weather";

const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export async function getWeatherLogs(token: string | null): Promise<WeatherLog[]> {
  const controller = new AbortController();
  const signal = controller.signal;

  const headers: Record<string,string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/weather-logs`, { method: "GET", headers, signal });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error(`Erro ao buscar weather logs (${res.status})`);
  return res.json();
}

export async function getInsights(token: string | null): Promise<InsightData> {
  const headers: Record<string,string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/insights`, { method: "GET", headers });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error(`Erro ao buscar insights (${res.status})`);
  return res.json();
}

export async function exportLogs(token: string | null, format: "csv" | "xlsx") {
  if (!token) throw new Error("Unauthorized");

  const headers: Record<string,string> = {
    "Authorization": `Bearer ${token}`,
  };

  const res = await fetch(`${API_BASE_URL}/weather-logs/export-${format}`, {
    method: "GET",
    headers,
  });

  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error(`Erro ao exportar (${res.status})`);

  const blob = await res.blob();
  const contentDisposition = res.headers.get("content-disposition");
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
