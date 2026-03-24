import { Controller, Patch, Param, Body, UseGuards, Get } from '@nestjs/common';
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

  @Patch(':id/en-camino')
  markEnCamino(@Param('id') id: string) {
    return this.clientsService.markEnCamino(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.clientsService.update(+id, updateData);
  }
}
