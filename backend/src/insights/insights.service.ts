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
   * Traduz códigos WMO para alertas humanos e identifica condições de risco.
   * Os códigos WMO (World Meteorological Organization) são usados pela Open-Meteo.
   * @param code Código do tempo WMO
   * @returns Uma string de alerta ou descrição do céu.
   */
  private analyzeWeatherCode(code: number): string {
    // Códigos baseados na tabela WMO (Open-Meteo)
    if (code === 0) return 'Céu limpo.';
    if (code >= 1 && code <= 3) return 'Parcialmente nublado.';
    if (code >= 51 && code <= 67)
      return 'Possibilidade de chuva leve/moderada.';
    if (code >= 71 && code <= 77) return 'Previsão de neve ou chuva congelada.';
    if (code >= 80 && code <= 82) return 'Pancadas de chuva fortes esperadas.';

    // Alertas de Risco (Códigos 95-99)
    if (code === 95)
      return '⚠️ ALERTA: Trovoadas moderadas ou fortes previstas. Busque abrigo.';
    if (code === 96) return '⚠️ PERIGO: Trovoadas com granizo leve previstas.';
    if (code === 99)
      return '⚠️ PERIGO EXTREMO: Trovoadas com granizo forte previstas! Fique em local seguro.';

    return 'Condições climáticas estáveis.';
  }

  /**
   * Gera um conjunto de insights climáticos baseados nos logs recentes,
   * incluindo análise preditiva de chuva e tempestade.
   */
  async generateInsights(): Promise<WeatherInsight> {
    const logs = await this.weatherLogsService.findRecentLogs(this.LOG_COUNT);

    if (logs.length === 0) {
      throw new NotFoundException(
        'Não há logs de clima suficientes para gerar insights.',
      );
    }

    const latest = logs[0];

    // --- 1. Dados Preditivos ---
    // rainProbability: Máx. de chuva nas próximas 6 horas (coletado pelo Python)
    const rainProb = latest.rainProbability || 0;
    const weatherCode = latest.weatherCode || 0;

    let rainAlert = '';
    let isStormIncoming = false;

    // Checa se o código WMO é um alerta de tempestade (95, 96, 99)
    if (weatherCode >= 95) {
      isStormIncoming = true;
    }

    // Gera alerta de chuva (se não houver alerta de tempestade mais grave)
    if (rainProb > 60 && !isStormIncoming) {
      rainAlert = `Alta chance de chuva (${rainProb.toFixed(0)}%) nas próximas 6 horas. Leve um guarda-chuva.`;
    } else if (rainProb > 30 && !isStormIncoming) {
      rainAlert = `Há uma chance moderada de chuva (${rainProb.toFixed(0)}%) em breve.`;
    } else if (rainProb <= 30 && !isStormIncoming) {
      rainAlert = 'Baixa probabilidade de precipitação nas próximas horas.';
    }

    const weatherAlert = this.analyzeWeatherCode(weatherCode);

    // --- 2. Cálculos Estatísticos (Tendência, Média, Conforto) ---
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
    if (isStormIncoming) classification = 'Alerta de Tempestade';
    else if (rainProb > 60) classification = 'Potencial Chuva';
    else if (latest.temperature > 30) classification = 'Quente e Seco';
    else if (latest.temperature < 18) classification = 'Frio';
    else if (latest.humidity > 75) classification = 'Úmido';

    // --- 3. Geração do Resumo de IA (Combinando Atual e Preditivo) ---
    let summary = '';

    // Começa com a previsão mais importante: O tempo futuro
    if (isStormIncoming) {
      summary += `🚨 **ALERTA DE PREVISÃO:** ${weatherAlert} Fique em local seguro. `;
    } else {
      summary += `Previsão: ${rainAlert} ${weatherAlert} `;
    }

    // Adiciona o estado atual
    summary += `Agora em ${latest.city}, a temperatura é ${latest.temperature}°C e a umidade está em ${latest.humidity}%. `;

    // Adiciona o contexto de conforto
    if (comfortScore < 40) {
      summary +=
        'As condições de conforto são baixas; evite esforço físico ao ar livre. ';
    } else if (comfortScore > 80) {
      summary += 'Ótimo clima! Ideal para atividades externas. ';
    }

    summary += `A tendência de temperatura recente é: ${trend.split(' ')[0]}.`;

    // --- 4. Ação Sugerida ---
    let suggestedAction = 'Monitorar tendências de temperatura e umidade.';
    if (isStormIncoming)
      suggestedAction =
        'BUSQUE ABRIGO IMEDIATAMENTE. Perigo de tempestade/granizo.';
    else if (rainProb > 50)
      suggestedAction =
        'Prepare-se para chuva forte e considere alterar planos externos.';
    else if (latest.temperature > 30)
      suggestedAction = 'Mantenha-se hidratado e procure sombras.';

    return {
      period: `Últimos ${logs.length} logs (incluindo previsão futura)`,
      totalRecords: logs.length,
      metrics: {
        avgTemperature: averageTemperature,
        avgHumidity: averageHumidity,
      },
      analysis: summary,
      suggestedAction: suggestedAction,
      latestTemperature: latest.temperature,
      latestHumidity: latest.humidity,
      trend: trend,
      comfortScore: comfortScore,
      classification: classification,
    } as WeatherInsight;
  }
}
