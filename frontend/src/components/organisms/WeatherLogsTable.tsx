import React, { useState, useMemo } from "react";
import { Card } from "../atoms/card";
import { Cloud, Droplet } from "lucide-react";
import type { WeatherLog } from "@/types/weather";
import { Pagination } from "../molecules/Pagination";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";

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
          icon: <Cloud className="h-4 w-4 text-yellow-500" />,
          color: "bg-yellow-100 text-yellow-800",
        };
      case "Nublado":
        return {
          icon: <Cloud className="h-4 w-4 text-gray-600" />,
          color: "bg-gray-200 text-gray-900",
        };
      case "Chuva Leve":
        return {
          icon: <Droplet className="h-4 w-4 text-blue-500" />,
          color: "bg-blue-100 text-blue-800",
        };
      default:
        return {
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

      <div className="rounded-md border-t overflow-hidden w-full ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Cidade</TableHead>
              <TableHead className="min-w-[150px]">Data/Hora</TableHead>
              <TableHead className="min-w-[120px]">Temp. (°C)</TableHead>
              <TableHead className="min-w-[120px]">Umidade (%)</TableHead>
              <TableHead className="min-w-[120px]">Condição</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => {
                const cond = getConditionDisplay(log.condition);

                return (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {log.city}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString("pt-BR")}
                      <span className="block text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
                      </span>
                    </TableCell>

                    <TableCell className="text-indigo-600 font-semibold">
                      {log.temperature.toFixed(1)}
                    </TableCell>

                    <TableCell className="text-gray-500">
                      {log.humidity}%
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${cond.color}`}
                      >
                        {cond.icon}
                        {log.condition}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

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
