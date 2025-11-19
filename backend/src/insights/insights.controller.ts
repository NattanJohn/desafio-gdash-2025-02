import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InsightsService } from './insights.service';
import { InsightResult } from './interfaces/insight-result.interface';

@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  /**
   * GET /insights
   * Retorna os insights de clima calculados (simulação de camada de IA).
   * @param days Número de dias a considerar no cálculo (default: 7).
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getInsights(@Query('days') days: string): Promise<InsightResult> {
    const period = days ? parseInt(days, 10) : 7;

    return this.insightsService.getBasicWeatherInsights(period);
  }
}
