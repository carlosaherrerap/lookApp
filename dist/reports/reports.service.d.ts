import { Repository } from 'typeorm';
import { VisitReport } from './entities/visit-report.entity';
import { ClientCreditInfo } from '../clients/entities/client-credit-info.entity';
import { EventsGateway } from '../events/events.gateway';
export declare class ReportsService {
    private readonly reportRepository;
    private readonly creditRepository;
    private readonly eventsGateway;
    constructor(reportRepository: Repository<VisitReport>, creditRepository: Repository<ClientCreditInfo>, eventsGateway: EventsGateway);
    createSyncReport(payload: any): Promise<VisitReport>;
}
