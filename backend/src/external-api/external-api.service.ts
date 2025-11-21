import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { PaginatedLaunches, SpaceXLaunch } from './interfaces/launch.interface';

interface SpaceXRawDoc {
  id: string;
  name: string;
  date_utc: string;
  rocket: { name: string } | null;
  details: string | null;
  success: boolean | null;
  links: {
    patch: {
      small: string | null;
    };
    webcast: string | null;
  };
}

interface SpaceXApiResponse {
  docs: SpaceXRawDoc[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);
  private readonly SPACEX_API_URL =
    'https://api.spacexdata.com/v4/launches/query';

  constructor(private readonly httpService: HttpService) {}

  async getSpaceXLaunches(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedLaunches> {
    this.logger.log(
      `Buscando lançamentos SpaceX - Página: ${page}, Limite: ${limit}`,
    );

    const payload = {
      query: {},
      options: {
        page,
        limit,
        sort: { date_utc: 'desc' },
        select: [
          'name',
          'date_utc',
          'rocket',
          'details',
          'success',
          'links',
          'id',
        ],
        populate: [{ path: 'rocket', select: { name: 1 } }],
      },
    };

    try {
      const response: AxiosResponse<SpaceXApiResponse> = await firstValueFrom(
        this.httpService.post<SpaceXApiResponse>(this.SPACEX_API_URL, payload),
      );

      const data = response.data;
      const mappedDocs: SpaceXLaunch[] = data.docs.map((doc: SpaceXRawDoc) => ({
        id: doc.id,
        mission_name: doc.name,
        date_utc: doc.date_utc,
        rocket: doc.rocket?.name || 'Unknown Rocket',
        details: doc.details,
        success: doc.success,
        links: {
          patch: {
            small: doc.links?.patch?.small || null,
          },
          webcast: doc.links?.webcast || null,
        },
      }));

      return {
        docs: mappedDocs,
        totalDocs: data.totalDocs,
        totalPages: data.totalPages,
        page: data.page,
        hasNextPage: data.hasNextPage,
        hasPrevPage: data.hasPrevPage,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`Erro ao buscar dados da SpaceX: ${errorMessage}`);

      throw new InternalServerErrorException(
        'Falha ao comunicar com a API da SpaceX.',
      );
    }
  }
}
