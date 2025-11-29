import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  PaginatedLaunches,
  SpaceXLaunch,
  SpaceXRocket,
} from './interfaces/launch.interface';

interface SpaceXRawDoc {
  id: string;
  name: string;
  date_utc: string;
  rocket: string;
  details: string | null;
  success: boolean | null;
  links: {
    patch: { small: string | null };
    webcast: string | null;
    youtube_id?: string | null;
    flickr?: { original: string[] };
  };
  launchpad?: {
    name: string;
    region: string;
    locality: string;
    latitude: number;
    longitude: number;
  } | null;
  payloads?: Array<{
    id: string;
    name: string;
    type: string;
    mass_kg: number | null;
    orbit: string | null;
  }>;
}

interface SpaceXApiResponse {
  docs: SpaceXRawDoc[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface SpaceXRawRocket {
  name: string;
  height: { meters: number | null };
  diameter: { meters: number | null };
  mass: { kg: number | null };
  stages: number | null;
  cost_per_launch: number | null;
  first_flight: string | null;
  flickr_images: string[];
}

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);

  private readonly SPACEX_API_URL =
    'https://api.spacexdata.com/v4/launches/query';

  private readonly ROCKET_URL = 'https://api.spacexdata.com/v4/rockets';

  constructor(private readonly httpService: HttpService) {}

  private async getFullRocketData(rocketId: string): Promise<SpaceXRocket> {
    try {
      const response: AxiosResponse<SpaceXRawRocket> = await firstValueFrom(
        this.httpService.get<SpaceXRawRocket>(`${this.ROCKET_URL}/${rocketId}`),
      );

      const r = response.data;

      return {
        name: r.name,
        height_m: r.height?.meters ?? null,
        diameter_m: r.diameter?.meters ?? null,
        mass_kg: r.mass?.kg ?? null,
        stages: r.stages ?? null,
        cost_per_launch: r.cost_per_launch ?? null,
        first_flight: r.first_flight ?? null,
        images: r.flickr_images ?? [],
      };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar dados completos do foguete (${rocketId}): ${error}`,
      );

      return {
        name: 'Unknown',
        height_m: null,
        diameter_m: null,
        mass_kg: null,
        stages: null,
        cost_per_launch: null,
        first_flight: null,
        images: [],
      };
    }
  }

  async getSpaceXLaunches(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedLaunches> {
    this.logger.log(
      `Buscando lançamentos SpaceX - Página ${page}, Limite ${limit}`,
    );

    const payload = {
      query: {},
      options: {
        page,
        limit,
        sort: { date_utc: 'desc' },
      },
    };

    try {
      const response: AxiosResponse<SpaceXApiResponse> = await firstValueFrom(
        this.httpService.post<SpaceXApiResponse>(this.SPACEX_API_URL, payload),
      );

      const data = response.data;

      // 🔥 PARA CADA LAUNCH, BUSCA O FOGUETE COMPLETO
      const mappedDocs: SpaceXLaunch[] = await Promise.all(
        data.docs.map(async (doc) => {
          const rocketFull = await this.getFullRocketData(doc.rocket);

          return {
            id: doc.id,
            mission_name: doc.name,
            date_utc: doc.date_utc,
            details: doc.details,
            success: doc.success,

            rocket: rocketFull,

            launchpad: doc.launchpad
              ? {
                  name: doc.launchpad.name,
                  region: doc.launchpad.region,
                  locality: doc.launchpad.locality,
                  latitude: doc.launchpad.latitude,
                  longitude: doc.launchpad.longitude,
                }
              : null,

            payloads:
              doc.payloads?.map((p) => ({
                id: p.id,
                name: p.name,
                type: p.type,
                mass_kg: p.mass_kg,
                orbit: p.orbit,
              })) ?? [],

            links: {
              patch: { small: doc.links.patch?.small ?? null },
              webcast: doc.links.webcast ?? null,
              youtube_id: doc.links.youtube_id ?? null,
              images: doc.links.flickr?.original ?? [],
            },
          };
        }),
      );

      return {
        docs: mappedDocs,
        totalDocs: data.totalDocs,
        totalPages: data.totalPages,
        page: data.page,
        hasNextPage: data.hasNextPage,
        hasPrevPage: data.hasPrevPage,
      };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar dados da SpaceX: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`,
      );

      throw new InternalServerErrorException(
        'Falha ao comunicar com a API da SpaceX.',
      );
    }
  }
}
