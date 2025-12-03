export interface WeatherLog {
    _id: string;
    city: string;
    country: string;
    temperature: number;
    humidity: number;
    timestamp: string;
    __v: number;
}

export interface Metrics {
    avgTemperature: number;
    avgHumidity: number;
}

export interface InsightData {
    period: string;
    totalRecords: number;
    metrics: Metrics;
    analysis: string;
    suggestedAction: string;
    latestTemperature: number;
    latestHumidity: number;
    trend: 'Estável' | 'Subindo' | 'Caindo';
    comfortScore: number;
    classification: string;
}
