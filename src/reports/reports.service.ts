import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisitReport } from './entities/visit-report.entity';
import { ClientCreditInfo } from '../clients/entities/client-credit-info.entity';
import { EventsGateway } from '../events/events.gateway';

import { Client } from '../clients/entities/client.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(VisitReport)
    private readonly reportRepository: Repository<VisitReport>,
    @InjectRepository(ClientCreditInfo)
    private readonly creditRepository: Repository<ClientCreditInfo>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createSyncReport(payload: any) {
    // 1. Crear el reporte de visita
    const reportData: any = {
      client: { id: payload.client_id },
      worker: { id: payload.worker_id },
      data: payload.data,
      event_timestamp: payload.event_timestamp ? new Date(payload.event_timestamp) : new Date(),
      sync_status: 'sincronizado',
    };

    // Solo asignar campos opcionales si existen — evita UpdateValuesMissingError
    if (payload.travel_time_seconds != null) reportData.travel_time_seconds = payload.travel_time_seconds;
    if (payload.visit_time_seconds != null) reportData.visit_time_seconds = payload.visit_time_seconds;
    if (payload.photos && payload.photos.length > 0) reportData.photos = payload.photos;
    if (payload.location_at_report) {
      reportData.location_at_report = {
        type: 'Point',
        coordinates: [payload.location_at_report.lng, payload.location_at_report.lat],
      };
    }

    const report = this.reportRepository.create(reportData);
    const savedReport = await this.reportRepository.save(report);

    // 2. Actualizar el estado del Cliente y LIBERAR al trabajador
    // El trabajador ya terminó su labor con este cliente, debe quedar disponible.
    await this.clientRepository.update(payload.client_id, {
      status: payload.new_status || 'visitado',
      current_worker: null as any,
    });

    // 3. Actualizar información crediticia si viene en el payload y tiene datos
    if (payload.credit_info && Object.keys(payload.credit_info).length > 0) {
      const creditInfo = await this.creditRepository.findOne({ where: { client_id: payload.client_id } });
      const newCreditInfo = creditInfo || this.creditRepository.create({ client_id: payload.client_id });
      
      // Solo realizar save si hay cambios reales en los valores
      const hasChanges = Object.keys(payload.credit_info).some(key => newCreditInfo[key] !== payload.credit_info[key]);
      if (hasChanges) {
        Object.assign(newCreditInfo, payload.credit_info);
        await this.creditRepository.save(newCreditInfo);
      }
    }

    // Emitir evento en tiempo real para actualizar Dashboard y Otros Apps
    this.eventsGateway.emitReportUpdate(savedReport);
    return savedReport;
  }
}
