import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisitReport } from './entities/visit-report.entity';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(VisitReport)
    private readonly reportRepository: Repository<VisitReport>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createSyncReport(payload: any) {
    const report = this.reportRepository.create({
      client: { id: payload.client_id },
      worker: { id: payload.worker_id },
      data: payload.data,
      event_timestamp: payload.event_timestamp ? new Date(payload.event_timestamp) : new Date(),
      sync_status: 'synced',
    });

    if (payload.location_at_report) {
      report.location_at_report = {
        type: 'Point',
        coordinates: [payload.location_at_report.lng, payload.location_at_report.lat],
      };
    }

    const savedReport = await this.reportRepository.save(report);
    
    // Emitir evento en tiempo real
    this.eventsGateway.emitReportUpdate(savedReport);
    
    return savedReport;
  }
}
