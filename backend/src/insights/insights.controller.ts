import {
  Controller,
  Get,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InsightsService } from './insights.service';
import { InsightResult } from './interfaces/insight-result.interface';

interface FullInsightResult extends InsightResult {
  latestTemperature: number;
  latestHumidity: number;
  trend: string;
  comfortScore: number;
  classification: string;
}

@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  /**
   * GET /insights
   * Retorna os insights de clima calculados (análise de média, tendência, conforto e resumo).
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @HttpCode(HttpStatus.OK)
  async getInsights(): Promise<FullInsightResult> {
    return this.insightsService.generateInsights();
  }
}
