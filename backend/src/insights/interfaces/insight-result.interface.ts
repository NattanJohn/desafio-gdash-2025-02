export interface InsightResult {
  period: string;
  totalRecords: number;
  metrics: {
    avgTemperature: number;
    avgHumidity: number;
  };
  analysis: string;
  suggestedAction: string;
}
