export interface InsightResult {
  period: string; // Ex: Últimos 10 logs
  totalRecords: number;
  metrics: {
    avgTemperature: number;
    avgHumidity: number;
  };
  analysis: string; // O Resumo em texto
  suggestedAction: string;
}
