import { Repository } from 'typeorm';
import { VisitReport } from './entities/visit-report.entity';
import { ClientCreditInfo } from '../clients/entities/client-credit-info.entity';
import { EventsGateway } from '../events/events.gateway';
import { Client } from '../clients/entities/client.entity';
export declare class ReportsService {
    private readonly reportRepository;
    private readonly creditRepository;
    private readonly clientRepository;
    private readonly eventsGateway;
    constructor(reportRepository: Repository<VisitReport>, creditRepository: Repository<ClientCreditInfo>, clientRepository: Repository<Client>, eventsGateway: EventsGateway);
    createSyncReport(payload: any): Promise<VisitReport[]>;
}
