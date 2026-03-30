import { ReportsService } from './reports.service';
import { ClientsService } from '../clients/clients.service';
export declare class ReportsController {
    private readonly reportsService;
    private readonly clientsService;
    constructor(reportsService: ReportsService, clientsService: ClientsService);
    createReport(createReportDto: any, req: any): Promise<import("./entities/visit-report.entity").VisitReport[]>;
}
