import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.clientsService.update(+id, updateData);
  }
}
