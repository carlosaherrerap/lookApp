import { Repository } from 'typeorm';
import { VisitReport } from './entities/visit-report.entity';
import { EventsGateway } from '../events/events.gateway';
export declare class ReportsService {
    private readonly reportRepository;
    private readonly eventsGateway;
    constructor(reportRepository: Repository<VisitReport>, eventsGateway: EventsGateway);
    createSyncReport(payload: any): Promise<VisitReport>;
}
