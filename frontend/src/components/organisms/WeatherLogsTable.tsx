import React, { useState, useMemo } from "react";
import { Card } from "../atoms/card";
import { Cloud, Droplet } from "lucide-react";
import type { WeatherLog } from "@/types/weather";
import { Pagination } from "../molecules/Pagination";

export const WeatherLogsTable: React.FC<{ logs: WeatherLog[] }> = ({
  logs,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const logsWithMockData = logs.map((log, index) => ({
    ...log,
    windSpeed: (log.temperature * 0.5 + log.humidity * 0.1) % 20,
    condition:
      index % 3 === 0
        ? "Nublado"
        : index % 3 === 1
        ? "Ensolarado"
        : "Chuva Leve",
  }));

  const sortedLogs = [...logsWithMockData].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const totalPages = Math.ceil(sortedLogs.length / pageSize);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLogs.slice(start, start + pageSize);
  }, [currentPage, sortedLogs]);

  const getConditionDisplay = (condition: string) => {
    switch (condition) {
      case "Ensolarado":
        return {
          text: "Ensolarado",
          icon: <Cloud className="h-4 w-4 text-yellow-500" />,
          color: "bg-yellow-100 text-yellow-800",
        };
      case "Nublado":
        return {
          text: "Nublado",
          icon: <Cloud className="h-4 w-4 text-gray-600" />,
          color: "bg-gray-200 text-gray-900",
        };
      case "Chuva Leve":
        return {
          text: "Chuva Leve",
          icon: <Droplet className="h-4 w-4 text-blue-500" />,
          color: "bg-blue-100 text-blue-800",
        };
      default:
        return {
          text: condition,
          icon: <Cloud className="h-4 w-4 text-gray-500" />,
          color: "bg-gray-50 text-gray-700",
        };
    }
  };

  return (
    <Card className="lg:col-span-1 p-0 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">Logs Recentes</h2>
        <p className="text-sm text-gray-500">
          Exibindo {paginatedLogs.length} de {logs.length} registros.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cidade
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data/Hora
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Temp. (°C)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Umidade (%)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Condição
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedLogs.map((log) => {
              const condition = getConditionDisplay(log.condition);
              return (
                <tr key={log._id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.city}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.timestamp).toLocaleDateString("pt-BR")}
                    <span className="block text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm font-medium text-indigo-600">
                    {log.temperature.toFixed(1)}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-500">
                    {log.humidity}%
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2 py-1 rounded-full ${condition.color}`}
                    >
                      {condition.icon}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {logs.length === 0 && (
        <p className="text-center text-gray-500 p-6">
          Nenhum registro de clima encontrado. O pipeline pode estar inativo.
        </p>
      )}
    </Card>
  );
};
