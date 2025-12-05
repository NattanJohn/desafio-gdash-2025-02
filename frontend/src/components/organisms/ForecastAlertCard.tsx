import type { InsightData } from "@/types/weather";
import {
  CloudRain,
  CloudOff,
  CloudLightning,
  Droplet,
  Zap,
} from "lucide-react";
import { Card } from "../atoms/card";

export const ForecastAlertCard = ({ data }: { data: InsightData }) => {
  const rainProb = data.rainProbability || 0;
  const weatherCode = data.weatherCode || 0;

  let title = "Sem Previsão Imediata";
  let message = "A chance de chuva é muito baixa nas próximas horas.";
  let icon = CloudOff;
  let cardColor = "bg-green-100 dark:bg-green-900/40 border-green-500";
  let iconColor = "text-green-600 dark:text-green-400";
  let isUrgent = false;

  if (weatherCode >= 95) {
    title = "ALERTA EXTREMO: TEMPESTADE!";
    message =
      "Risco de trovoadas, granizo ou chuva intensa. Busque abrigo seguro imediatamente.";
    icon = CloudLightning;
    cardColor = "bg-red-100 dark:bg-red-900/60 border-red-700 animate-pulse";
    iconColor = "text-red-700 dark:text-red-400";
    isUrgent = true;
  } else if (rainProb >= 60) {
    title = "Alta Probabilidade de Chuva";
    message = `Chance de ${rainProb.toFixed(
      0
    )}% nas próximas 6 horas. Leve um guarda-chuva!`;
    icon = CloudRain;
    cardColor = "bg-sky-100 dark:bg-sky-900/40 border-sky-500";
    iconColor = "text-sky-600 dark:text-sky-400";
  } else if (rainProb >= 30) {
    title = "Chance Moderada de Chuva";
    message = `Risco de ${rainProb.toFixed(
      0
    )}% de precipitação. Esteja atento.`;
    icon = Droplet;
    cardColor = "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-500";
    iconColor = "text-yellow-600 dark:text-yellow-400";
  }

  const AlertIcon = icon;

  return (
    <Card
      className={`p-4 flex items-center gap-4 border-l-8 shadow-xl ${cardColor}`}
    >
      <div
        className={`p-3 rounded-full shrink-0 shadow-lg ${
          isUrgent ? "bg-red-700" : "bg-white dark:bg-gray-700"
        }`}
      >
        <AlertIcon className={`h-8 w-8 ${iconColor}`} />
      </div>

      <div className="flex flex-col justify-center overflow-hidden">
        <h3
          className={`text-lg font-extrabold truncate ${
            isUrgent
              ? "text-red-700 dark:text-red-400"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {title}
          {isUrgent && (
            <Zap className="h-4 w-4 inline ml-2 text-yellow-400 fill-yellow-400" />
          )}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
          {message}
        </p>
        {!isUrgent && rainProb > 0 && (
          <p className="text-xs font-semibold mt-1 flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <Droplet className="h-3 w-3" /> Máx. Probabilidade:{" "}
            {rainProb.toFixed(0)}%
          </p>
        )}
      </div>
    </Card>
  );
};

export default ForecastAlertCard;
