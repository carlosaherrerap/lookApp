import { Controller, Patch, Param, Body, UseGuards, Get, Req } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('mundo')
  getMundo() {
    return this.clientsService.findMundo();
  }

  @Get('active')
  getActive(@Req() req: any) {
    return this.clientsService.findActiveByWorker(req.user.userId);
  }

  @Patch(':id/en-camino')
  markEnCamino(@Param('id') id: string, @Req() req: any) {
    return this.clientsService.markEnCamino(+id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.clientsService.update(+id, updateData);
  }
}
