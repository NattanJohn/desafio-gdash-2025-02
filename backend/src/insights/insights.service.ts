import { Injectable, NotFoundException } from '@nestjs/common';
import { WeatherLogsService } from '../weather-logs/weather-logs.service';
import { InsightResult } from './interfaces/insight-result.interface';

interface WeatherInsight extends InsightResult {
  latestTemperature: number;
  latestHumidity: number;
  trend: string;
  comfortScore: number;
  classification: string;
}

@Injectable()
export class InsightsService {
  private readonly LOG_COUNT = 10;
  private readonly TREND_COUNT = 5;

  constructor(private readonly weatherLogsService: WeatherLogsService) {}

  /**
   * Gera um conjunto de insights climáticos baseados nos logs recentes.
   */
  async generateInsights(): Promise<WeatherInsight> {
    const logs = await this.weatherLogsService.findRecentLogs(this.LOG_COUNT);

    if (logs.length === 0) {
      throw new NotFoundException(
        'Não há logs de clima suficientes para gerar insights.',
      );
    }

    const latest = logs[0];
    const totalTemp = logs.reduce((sum, log) => sum + log.temperature, 0);
    const totalHumid = logs.reduce((sum, log) => sum + log.humidity, 0);
    const averageTemperature = parseFloat((totalTemp / logs.length).toFixed(1));
    const averageHumidity = parseFloat((totalHumid / logs.length).toFixed(0));

    let trend = 'Estável';
    if (logs.length >= this.LOG_COUNT) {
      const recentTemps = logs.slice(0, this.TREND_COUNT);
      const olderTemps = logs.slice(this.TREND_COUNT, this.LOG_COUNT);

      const avgRecent =
        recentTemps.reduce((sum, log) => sum + log.temperature, 0) /
        recentTemps.length;
      const avgOlder =
        olderTemps.reduce((sum, log) => sum + log.temperature, 0) /
        olderTemps.length;

      const diff = avgRecent - avgOlder;

      if (diff > 0.5) {
        trend = 'Temperatura em Leve Aumento (+' + diff.toFixed(1) + '°C)';
      } else if (diff < -0.5) {
        trend =
          'Temperatura em Leve Queda (-' + Math.abs(diff).toFixed(1) + '°C)';
      }
    }

    const tempPenalty = Math.abs(latest.temperature - 24) * 4;
    const humidPenalty = Math.abs(latest.humidity - 50) * 0.5;
    let comfortScore = 100 - tempPenalty - humidPenalty;
    comfortScore = Math.max(0, parseFloat(comfortScore.toFixed(0)));

    let classification = 'Agradável';
    if (latest.temperature > 30) classification = 'Quente e Seco';
    else if (latest.temperature < 18) classification = 'Frio';
    else if (latest.humidity > 75) classification = 'Úmido (Possível Chuva)';

    let summary = `A temperatura atual em ${latest.city} é de ${latest.temperature}°C com umidade de ${latest.humidity}%. `;
    summary += `A média de temperatura registrada foi de ${averageTemperature}°C. `;
    summary += `O clima é classificado como "${classification}", e a tendência de temperatura é ${trend.toLowerCase()}. O índice de conforto atual é de ${comfortScore}/100.`;

    return {
      period: `Últimos ${logs.length} logs`,
      totalRecords: logs.length,
      metrics: {
        avgTemperature: averageTemperature,
        avgHumidity: averageHumidity,
      },
      analysis: summary,
      suggestedAction:
        'Monitorar tendências de temperatura e umidade para antecipar eventos climáticos.',
      latestTemperature: latest.temperature,
      latestHumidity: latest.humidity,
      trend: trend,
      comfortScore: comfortScore,
      classification: classification,
    } as WeatherInsight;
  }
}
