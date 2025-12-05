import { Card } from "@/components/atoms/card";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Clock,
  CloudLightning,
  CloudRain,
  AlertTriangle,
  Sun,
  ThermometerSnowflake,
} from "lucide-react";
import type { InsightData } from "@/types/weather";

export const InsightCard = ({ data }: { data: InsightData }) => {
  const isIncreasing = data.trend.includes("Aumento");
  const isDecreasing = data.trend.includes("Queda");
  const trendIcon = isIncreasing
    ? TrendingUp
    : isDecreasing
    ? TrendingDown
    : Clock;

  let trendColor = "text-gray-500 dark:text-gray-400";
  if (isIncreasing) trendColor = "text-red-500";
  if (isDecreasing) trendColor = "text-blue-500";

  const TrendIcon = trendIcon;

  let classificationColor = "bg-green-500";
  let ClassificationIcon = Sun;
  const isUrgentAlert = data.classification === "Alerta de Tempestade";

  if (isUrgentAlert) {
    classificationColor = "bg-red-700 animate-pulse";
    ClassificationIcon = CloudLightning;
  } else if (
    data.classification === "Potencial Chuva" ||
    data.classification.includes("Úmido")
  ) {
    classificationColor = "bg-sky-600";
    ClassificationIcon = CloudRain;
  } else if (
    data.classification.includes("Quente") ||
    data.classification.includes("Seco")
  ) {
    classificationColor = "bg-orange-500";
    ClassificationIcon = Sun;
  } else if (data.classification.includes("Frio")) {
    classificationColor = "bg-blue-600";
    ClassificationIcon = ThermometerSnowflake;
  } else {
    ClassificationIcon = Sun;
  }

  const actionStyles = isUrgentAlert
    ? "border-l-8 border-red-700 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200"
    : "border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-gray-700 dark:text-gray-200";

  return (
    <Card className="col-span-1 lg:col-span-2 flex flex-col justify-between p-6">
      <div className="flex flex-col grow">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
          <LayoutDashboard className="h-6 w-6 text-indigo-600" />
          Análise Preditiva e Insights de IA
        </h2>

        <div
          className={`p-6 rounded-xl text-white mb-6 shadow-2xl transform transition-transform duration-300 hover:scale-[1.02] ${classificationColor}`}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-6">
            {/* Classificação */}
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <ClassificationIcon className="h-10 w-10" />
              <p className="text-xl font-extrabold leading-none">
                {data.classification}
              </p>
            </div>

            {/* Pontuação */}
            <div className="text-center sm:text-right">
              <span className="text-xl font-medium block">Conforto</span>
              <span className="text-4xl font-extrabold">
                {data.comfortScore}
                <span className="text-xl font-medium">/100</span>
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 grow mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Relatório de Previsão
          </h3>
          <p
            className="text-gray-700 dark:text-gray-300 italic p-4 border-l-4 border-indigo-500 bg-indigo-50 dark:bg-gray-700/50 rounded-r-lg"
            dangerouslySetInnerHTML={{
              __html: data.analysis.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
              ),
            }}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div
          className={`flex items-start gap-3 text-sm font-medium pl-3 py-2 rounded-r-lg ${actionStyles}`}
        >
          <AlertTriangle
            className={`h-5 w-5 shrink-0 ${
              isUrgentAlert ? "text-red-700" : "text-yellow-600"
            }`}
          />
          <div className="flex flex-col text-center sm:text-left">
            <span className="font-bold uppercase">Ação Sugerida</span>
            <span className="wrap-break-words">{data.suggestedAction}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <div className="text-gray-500 dark:text-gray-400">
            Média Temp. Histórica:
            <span className="font-bold text-gray-900 dark:text-white block text-lg">
              {data.metrics.avgTemperature.toFixed(1)}°C
            </span>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Tendência de Temperatura:
            <span
              className={`font-bold flex items-center gap-1 text-lg ${trendColor}`}
            >
              <TrendIcon className="h-5 w-5 shrink-0" />{" "}
              {data.trend.split("(")[0].trim()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InsightCard;
