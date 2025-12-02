// components/molecules/LaunchCard.tsx
import React from "react";
import { Calendar, Rocket, Info } from "lucide-react";
import { StatusBadge } from "../atoms/status-badge";
import { Button } from "../atoms/button";
import { Card } from "../atoms/card";

export interface SpaceXRocket {
  name: string;
  height_m: number | null;
  diameter_m: number | null;
  mass_kg: number | null;
  stages: number | null;
  cost_per_launch: number | null;
  first_flight: string | null;
  images: string[];
}

export interface SpaceXLaunchpad {
  name: string;
  region: string;
  locality: string;
  latitude: number;
  longitude: number;
}

export interface SpaceXPayload {
  id: string;
  name: string;
  type: string;
  mass_kg: number | null;
  orbit: string | null;
}

export interface SpaceXLaunch {
  id: string;
  mission_name: string;
  date_utc: string;
  details: string | null;
  success: boolean | null;
  rocket: SpaceXRocket;
  launchpad?: SpaceXLaunchpad | null;
  payloads: SpaceXPayload[];
  links: {
    patch: { small: string | null };
    webcast: string | null;
    youtube_id?: string | null;
    images?: string[];
  };
}

interface LaunchCardProps {
  launch: SpaceXLaunch;
  onOpenDetails?: (launch: SpaceXLaunch) => void;
}

const formatLocalDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

const daysSince = (iso: string) => {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Hoje";
    if (days === 1) return "1 dia atrás";
    return `${days} dias`;
  } catch {
    return "";
  }
};

export const LaunchCard: React.FC<LaunchCardProps> = ({
  launch,
  onOpenDetails,
}) => {
  const patch = launch.links?.patch?.small ?? null;
  const image = (launch.links.images && launch.links.images[0]) ?? patch;

  return (
    <Card className="rounded-xl overflow-hidden flex flex-col h-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800">
      <div className="h-40 bg-gray-50 dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={launch.mission_name}
            className="w-full h-48 object-contain bg-black"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-gray-300">
            <Rocket className="w-12 h-12" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col grow">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div>
            <h3 className="text-md font-semibold text-gray-900 dark:text-white leading-tight">
              {launch.mission_name}
            </h3>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <Calendar className="w-3 h-3" />
              <span>{formatLocalDateTime(launch.date_utc)}</span>
              <span className="px-1">·</span>
              <span>{daysSince(launch.date_utc)}</span>
            </div>
          </div>

          <StatusBadge success={launch.success} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            <span>{launch.rocket?.name ?? "Unknown Rocket"}</span>
          </div>

          {launch.launchpad && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {launch.launchpad.locality} · {launch.launchpad.name}
            </div>
          )}

          <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
            Payloads: {launch.payloads?.length ?? 0}
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mt-3 mb-3 grow">
          {launch.details ?? "Sem detalhes disponíveis para esta missão."}
        </p>

        <div className="mt-2 flex gap-2">
          {launch.links?.webcast && (
            <a
              href={launch.links.webcast}
              target="_blank"
              rel="noreferrer"
              className="
                flex-1 inline-flex items-center justify-center gap-2 px-3 py-2
                rounded-md border border-indigo-200 dark:border-indigo-900
                text-indigo-600 dark:text-indigo-400 text-xs font-semibold
                hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition
              "
            >
              Assistir
            </a>
          )}

          {onOpenDetails && (
            <Button
              onClick={() => onOpenDetails(launch)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-neutral-700 text-sm"
            >
              <Info className="w-4 h-4" />
              Detalhes
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
