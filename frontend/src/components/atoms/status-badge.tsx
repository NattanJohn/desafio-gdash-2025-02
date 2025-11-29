import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export const StatusBadge: React.FC<{ success: boolean | null }> = ({ success }) => {
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
