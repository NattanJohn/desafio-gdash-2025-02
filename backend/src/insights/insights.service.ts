import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WeatherLogDocument,
  WeatherLog,
} from '../weather-logs/schemas/weather-logs.schema';
import { InsightResult } from './interfaces/insight-result.interface';
import { AggregationResultItem } from './interfaces/aggregation-result.interface';

@Injectable()
export class InsightsService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async getBasicWeatherInsights(days: number = 7): Promise<InsightResult> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const aggregationResult: AggregationResultItem[] =
      (await this.weatherLogModel
        .aggregate([
          { $match: { timestamp: { $gte: cutoffDate } } },
          {
            $group: {
              _id: null,
              averageTemperature: { $avg: '$temperature' },
              averageHumidity: { $avg: '$humidity' },
              count: { $sum: 1 },
            },
          },
          { $project: { _id: 0 } },
        ])
        .exec()) as AggregationResultItem[];

    const defaultStats: AggregationResultItem = {
      _id: null,
      averageTemperature: 0,
      averageHumidity: 0,
      count: 0,
    };

    const stats: AggregationResultItem = aggregationResult[0] || defaultStats;

    const insight: InsightResult = {
      period: `${days} dias`,
      totalRecords: stats.count,
      metrics: {
        avgTemperature: parseFloat(stats.averageTemperature.toFixed(2)),
        avgHumidity: parseFloat(stats.averageHumidity.toFixed(2)),
      },
      analysis:
        stats.averageTemperature > 25
          ? 'A temperatura média indica um período de calor intenso, monitorar a umidade para risco de incêndio.'
          : 'As condições climáticas estão moderadas e favoráveis.',
      suggestedAction: 'N/A',
    };

    return insight;
  }
}
