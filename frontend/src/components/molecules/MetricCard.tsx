import React from "react";
import { Card } from "../atoms/card";

export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  unit: string;
  icon: React.ElementType;
  color: string;
}> = ({ title, value, unit, icon: Icon, color }) => (
  <Card className="flex items-center justify-between">
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <div className="text-3xl text-center font-bold text-gray-900 dark:text-white">
        {value}
        <span className="text-xl font-normal ml-1">{unit}</span>
      </div>
    </div>
    <div
      className={`p-3 rounded-full ${color} bg-opacity-10 dark:bg-opacity-20`}
    >
      <Icon className={`h-6 w-6 ${color}`} />
    </div>
  </Card>
);
