import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ClientsService } from '../clients/clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly clientsService: ClientsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createReport(@Body() createReportDto: any, @Req() req: any) {
    // Si el payload no trae worker_id, usamos el del JWT
    const reportData = {
      ...createReportDto,
      worker_id: createReportDto.worker_id || req.user.userId
    };
    
    const savedReport = await this.reportsService.createSyncReport(reportData);
    
    // Actualizar estado del cliente si se proporciona un nuevo estado
    if (createReportDto.new_status) {
      await this.clientsService.update(createReportDto.client_id, { 
        status: createReportDto.new_status 
      });
    }

    return savedReport;
  }
}
