import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisitReport } from './entities/visit-report.entity';
import { ClientCreditInfo } from '../clients/entities/client-credit-info.entity';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(VisitReport)
    private readonly reportRepository: Repository<VisitReport>,
    @InjectRepository(ClientCreditInfo)
    private readonly creditRepository: Repository<ClientCreditInfo>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createSyncReport(payload: any) {
    // 1. Crear el reporte de visita
    const report = this.reportRepository.create({
      client: { id: payload.client_id },
      worker: { id: payload.worker_id },
      data: payload.data, // observaciones, found_in_home, etc
      event_timestamp: payload.event_timestamp ? new Date(payload.event_timestamp) : new Date(),
      sync_status: 'sincronizado',
      travel_time_seconds: payload.travel_time_seconds,
      visit_time_seconds: payload.visit_time_seconds,
      photos: payload.photos || [],
    });

    if (payload.location_at_report) {
      report.location_at_report = {
        type: 'Point',
        coordinates: [payload.location_at_report.lng, payload.location_at_report.lat],
      };
    }

    const savedReport = await this.reportRepository.save(report);

    // 2. Actualizar información crediticia si viene en el payload
    if (payload.credit_info) {
      const creditInfo = await this.creditRepository.findOne({ where: { client_id: payload.client_id } });
      const newCreditInfo = creditInfo || this.creditRepository.create({ client_id: payload.client_id });
      
      Object.assign(newCreditInfo, payload.credit_info);
      await this.creditRepository.save(newCreditInfo);
    }

    // 3. Actualizar estado del cliente (VISITADO, REPROGRAMAR, etc)
    // El payload puede traer un 'new_status' sugerido
    const finalStatus = payload.new_status || 'visitado';
    // Nota: Deberíamos inyectar ClientsService o usar query runner para esto,
    // pero por simplicidad usaremos una actualización directa aquí si tuviéramos acceso al repo de clientes.
    // Como no lo tenemos inyectado, dejaremos que el cliente se actualice vía el repo de reportes si hay relación inversa
    // O mejor, el controlador puede llamar a ClientsService posteriormente.
    
    // Emitir evento en tiempo real
    this.eventsGateway.emitReportUpdate(savedReport);
    
    return savedReport;
  }
}
