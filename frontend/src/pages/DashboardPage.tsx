import {
  Cloud,
  Droplet,
  Thermometer,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "../components/atoms/button";
import { Card } from "../components/atoms/card";
import { MetricCard } from "../components/molecules/MetricCard";
import { InsightCard } from "../components/molecules/InsigthCard";
import { WeatherLogsTable } from "../components/organisms/WeatherLogsTable";
import { Sidebar } from "../components/organisms/Sidebar";
import { useWeatherDashboard } from "@/hooks/useWeatherDashboard";
import { useAuth } from "@/contexts/useAuth";
import { TemperatureChart } from "@/components/molecules/TemperatureChart";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Dashboardpage() {
  const { logout } = useAuth();
  const { collapsed } = useSidebar();
  const {
    logs,
    insights,
    loading,
    error,
    refresh,
    exportFile,
    latest,
    cityCountry,
  } = useWeatherDashboard({ intervalMillis: 30000 });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="ml-4 text-xl font-medium text-gray-700">
          Carregando dados do Clima e Insights...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-600 mb-2">
          Erro de Comunicação com a API
        </h2>
        <p className="text-center text-gray-600 max-w-lg">{error}</p>

        <Button onClick={refresh} className="mt-6 gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!insights || logs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar logout={logout} />

        <main className="flex-1 p-4 md:p-8 md:ml-72">
          <Cloud className="h-16 w-16 text-indigo-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            Aguardando Dados do Pipeline
          </h2>

          <Button onClick={refresh} className="mt-6 gap-2">
            <RefreshCw className="h-4 w-4" />
            Verificar novamente
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar logout={logout} />

      <main
        className={`
          flex-1 p-4 md:p-8 transition-all duration-300
          ${collapsed ? "md:ml-20" : "md:ml-72"}
          `}
      >
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 md:ml-0 ml-16">
              Dashboard Climático de {cityCountry}
            </h1>
            <p className="text-gray-500 text-sm md:ml-0 ml-16">
              {cityCountry} - Atualizado:{" "}
              {latest
                ? new Date(latest.timestamp).toLocaleString("pt-BR")
                : "N/A"}
            </p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => exportFile("csv")}
              className="gap-2"
            >
              <Download className="h-4 w-4" /> CSV
            </Button>

            <Button
              variant="outline"
              onClick={() => exportFile("xlsx")}
              className="gap-2"
            >
              <Download className="h-4 w-4" /> XLSX
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Temperatura Atual"
            value={insights.latestTemperature.toFixed(1)}
            unit="°C"
            icon={Thermometer}
            color="text-red-500"
          />
          <MetricCard
            title="Umidade Atual"
            value={insights.latestHumidity}
            unit="%"
            icon={Droplet}
            color="text-blue-500"
          />
          <MetricCard
            title="Classificação AI"
            value={insights.classification}
            unit=""
            icon={Cloud}
            color="text-green-500"
          />
          <MetricCard
            title="Conforto"
            value={insights.comfortScore}
            unit="/100"
            icon={TrendingUp}
            color="text-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InsightCard data={insights} />
          <WeatherLogsTable logs={logs} />
        </div>

        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-indigo-600" />
                Evolução da Temperatura
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Variação térmica nas últimas horas.
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
              Ao vivo
            </span>
          </div>

          <div className="w-full">
            <TemperatureChart data={logs} />
          </div>
        </Card>
      </main>
    </div>
  );
}
