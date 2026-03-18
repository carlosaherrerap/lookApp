import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  create(@Body() createRouteDto: any) {
    return this.routesService.create(createRouteDto);
  }

  // New endpoint to fetch routes assigned to the authenticated worker
  @Get('worker')
  async findByWorker(@Req() req) {
    const workerId = req.user?.userId;
    if (!workerId) {
      throw new Error('Worker ID not found in request');
    }
    return this.routesService.findByWorker(workerId);
  }

  @Get()
  findAll() {
    return this.routesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRouteDto: any) {
    return this.routesService.update(+id, updateRouteDto);
  }
}
