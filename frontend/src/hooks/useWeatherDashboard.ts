// src/hooks/useWeatherDashboard.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getWeatherLogs, getInsights, exportLogs } from "@/services/weatherService";
import type { InsightData, WeatherLog } from "@/types/weather";
import { useAuth } from "@/contexts/useAuth";

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

export function useWeatherDashboard({ intervalMillis = 30000 } = {}) {
  const { token, logout } = useAuth();
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);
  const intervalRef = useRef<number | null>(null);

  const fetchAll = useCallback(async () => {
    if (!token) {
      setError("Usuário não autenticado");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [logsResp, insightsResp] = await Promise.all([
        getWeatherLogs(token),
        getInsights(token),
      ]);
      if (!isMounted.current) return;
      setLogs(logsResp);
      setInsights(insightsResp);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      if (msg === "Unauthorized") {
        setError("Sessão expirada");
        logout();
      } else {
        setError(msg ?? "Erro ao carregar dados");
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    isMounted.current = true;
    void fetchAll();

    if (intervalMillis > 0) {
      intervalRef.current = window.setInterval(() => {
        void fetchAll();
      }, intervalMillis);
    }

    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchAll, intervalMillis]);

  const refresh = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

  const exportFile = useCallback(
    async (format: "csv" | "xlsx") => {
      if (!token) {
        setError("Usuário não autenticado");
        return;
      }
      try {
        setLoading(true);
        await exportLogs(token, format);
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        if (msg === "Unauthorized") {
          setError("Sessão expirada");
          logout();
        } else {
          setError(msg ?? "Erro ao exportar");
        }
      } finally {
        setLoading(false);
      }
    },
    [token, logout]
  );

  const latest = useMemo(() => logs[0] ?? null, [logs]);
  const cityCountry = useMemo(
    () => (latest && latest.city && latest.country ? `${latest.city}, ${latest.country}` : "Localização Desconhecida"),
    [latest]
  );

  return {
    logs,
    insights,
    loading,
    error,
    refresh,
    exportFile,
    latest,
    cityCountry,
  } as const;
}
