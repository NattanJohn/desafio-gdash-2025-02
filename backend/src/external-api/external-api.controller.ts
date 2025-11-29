import { Controller, Get, Query } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';

@Controller('spacex')
export class ExternalApiController {
  constructor(private readonly externalApiService: ExternalApiService) {}

  @Get('launches')
  async getLaunches(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.externalApiService.getSpaceXLaunches(page, limit);
  }
}
