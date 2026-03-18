import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    createReport(createReportDto: any): Promise<import("./entities/visit-report.entity").VisitReport>;
}
