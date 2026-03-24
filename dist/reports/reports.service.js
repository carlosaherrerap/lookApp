"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const visit_report_entity_1 = require("./entities/visit-report.entity");
const client_credit_info_entity_1 = require("../clients/entities/client-credit-info.entity");
const events_gateway_1 = require("../events/events.gateway");
let ReportsService = class ReportsService {
    reportRepository;
    creditRepository;
    eventsGateway;
    constructor(reportRepository, creditRepository, eventsGateway) {
        this.reportRepository = reportRepository;
        this.creditRepository = creditRepository;
        this.eventsGateway = eventsGateway;
    }
    async createSyncReport(payload) {
        const report = this.reportRepository.create({
            client: { id: payload.client_id },
            worker: { id: payload.worker_id },
            data: payload.data,
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
        if (payload.credit_info) {
            const creditInfo = await this.creditRepository.findOne({ where: { client_id: payload.client_id } });
            const newCreditInfo = creditInfo || this.creditRepository.create({ client_id: payload.client_id });
            Object.assign(newCreditInfo, payload.credit_info);
            await this.creditRepository.save(newCreditInfo);
        }
        const finalStatus = payload.new_status || 'visitado';
        this.eventsGateway.emitReportUpdate(savedReport);
        return savedReport;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(visit_report_entity_1.VisitReport)),
    __param(1, (0, typeorm_1.InjectRepository)(client_credit_info_entity_1.ClientCreditInfo)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        events_gateway_1.EventsGateway])
], ReportsService);
//# sourceMappingURL=reports.service.js.map