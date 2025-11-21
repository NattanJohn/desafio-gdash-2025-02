import {
  Controller,
  Get,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExternalApiService } from './external-api.service';
import { PaginatedLaunches } from './interfaces/launch.interface';

@Controller('external-data')
@UseGuards(AuthGuard('jwt'))
export class ExternalApiController {
  constructor(private readonly externalApiService: ExternalApiService) {}

  /**
   * GET /external-data/spacex/launches?page=1&limit=10
   * Retorna lançamentos paginados.
   */
  @Get('spacex/launches')
  async getLaunches(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedLaunches> {
    return this.externalApiService.getSpaceXLaunches(page, limit);
  }
}
