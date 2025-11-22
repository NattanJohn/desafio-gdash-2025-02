import { Card } from "@/components/atoms/card";
import type { InsightData } from "@/types/weather";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
} from "lucide-react";

export const InsightCard = ({ data }: { data: InsightData }) => {
  const trendIcon =
    data.trend === "Subindo"
      ? TrendingUp
      : data.trend === "Caindo"
      ? TrendingDown
      : Clock;

  let trendColor = "text-gray-500 dark:text-gray-400";
  if (data.trend === "Subindo") trendColor = "text-red-500";
  if (data.trend === "Caindo") trendColor = "text-blue-500";

  let classificationColor = "bg-green-500";
  if (
    data.classification === "Quente" ||
    data.classification === "Calor Extremo"
  ) {
    classificationColor = "bg-red-500";
  } else if (
    data.classification === "Frio" ||
    data.classification === "Risco de Geada"
  ) {
    classificationColor = "bg-blue-500";
  } else if (data.classification.includes("Chuva")) {
    classificationColor = "bg-indigo-500";
  }

  const TrendIcon = trendIcon;

  return (
    <Card className="col-span-1 lg:col-span-2 flex flex-col justify-between">
      <div className="mx-8 my-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-indigo-600" />
          Insights de IA e Análise
        </h2>

        <div
          className={`p-5 rounded-xl text-white mb-6 ${classificationColor} shadow-xl transform transition-transform duration-300 hover:scale-[1.02]`}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold">
                Classificação AI: {data.classification}
              </p>
              <p className="text-sm opacity-90">{data.period}</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-medium block">Conforto</span>
              <span className="text-4xl font-extrabold">
                {data.comfortScore}/100
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Análise do Período
          </h3>
          <p className="text-gray-700 dark:text-gray-300 italic p-3 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-gray-700/50 rounded-r-lg">
            {data.analysis}
          </p>
        </div>
      </div>

      <div className="mx-8 my-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 font-medium border-l-4 border-yellow-500 pl-3 py-1 mb-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-r-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
          <span className="truncate">
            Ação Sugerida: {data.suggestedAction}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-gray-500 dark:text-gray-400">
            Média Temp. Histórica:
            <span className="font-bold text-gray-900 dark:text-white block">
              {data.metrics.avgTemperature.toFixed(1)}°C
            </span>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Tendência de Temperatura:
            <span
              className={`font-bold flex items-center gap-1 ${trendColor}`}
            >
              <TrendIcon className="h-4 w-4" /> {data.trend}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InsightCard;
