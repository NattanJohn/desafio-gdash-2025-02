import React from "react";
import { Calendar, Rocket, CheckCircle2, XCircle } from "lucide-react";

export interface SpaceXLaunch {
  id: string;
  mission_name: string;
  date_utc: string;
  rocket: string;
  details: string | null;
  success: boolean | null;
  links: {
    patch: {
      small: string | null;
    };
    webcast: string | null;
  };
}

const StatusBadge = ({ success }: { success: boolean | null }) => {
  if (success === true) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 className="w-3 h-3" /> Sucesso
      </span>
    );
  }
  if (success === false) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        <XCircle className="w-3 h-3" /> Falha
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
      Pendente
    </span>
  );
};

export const LaunchCard: React.FC<{ launch: SpaceXLaunch }> = ({ launch }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full">
      <div className="p-5 flex flex-col grow">
        <div className="flex justify-between items-start mb-4">
          <div className="w-16 h-16 shrink-0 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center p-1">
            {launch.links.patch.small ? (
              <img
                src={launch.links.patch.small}
                alt={launch.mission_name}
                className="w-full h-full object-contain"
              />
            ) : (
              <Rocket className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <StatusBadge success={launch.success} />
        </div>

        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1">
            {launch.mission_name}
          </h3>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(launch.date_utc).toLocaleDateString("pt-BR")}
          </div>
        </div>

        <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-3">
          <Rocket className="w-4 h-4 mr-1.5" />
          {launch.rocket}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 grow">
          {launch.details || "Sem detalhes disponíveis para esta missão."}
        </p>
        {launch.links.webcast && (
          <a
            href={launch.links.webcast}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-center block w-full py-2 rounded-lg border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors"
          >
            Assistir Lançamento
          </a>
        )}
      </div>
    </div>
  );
};
