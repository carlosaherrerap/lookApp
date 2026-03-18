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
exports.TrackingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tracking_history_entity_1 = require("./entities/tracking-history.entity");
const time_log_entity_1 = require("./entities/time-log.entity");
const events_gateway_1 = require("../events/events.gateway");
let TrackingService = class TrackingService {
    trackingRepository;
    timeLogRepository;
    eventsGateway;
    constructor(trackingRepository, timeLogRepository, eventsGateway) {
        this.trackingRepository = trackingRepository;
        this.timeLogRepository = timeLogRepository;
        this.eventsGateway = eventsGateway;
    }
    async saveTrackingHistory(payload) {
        const log = this.trackingRepository.create({
            worker: { id: payload.worker_id },
            event_timestamp: payload.event_timestamp ? new Date(payload.event_timestamp) : new Date(),
            location: {
                type: 'Point',
                coordinates: [payload.lng, payload.lat],
            },
        });
        const savedLog = await this.trackingRepository.save(log);
        this.eventsGateway.emitTrackingUpdate({
            worker_id: payload.worker_id,
            lat: payload.lat,
            lng: payload.lng,
            timestamp: savedLog.event_timestamp,
        });
        return savedLog;
    }
    async saveTimeLog(payload) {
        const timeLog = this.timeLogRepository.create({
            worker: { id: payload.worker_id },
            type: payload.type,
            event_timestamp: payload.event_timestamp ? new Date(payload.event_timestamp) : new Date(),
        });
        if (payload.location) {
            timeLog.location = {
                type: 'Point',
                coordinates: [payload.location.lng, payload.location.lat],
            };
        }
        return await this.timeLogRepository.save(timeLog);
    }
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tracking_history_entity_1.TrackingHistory)),
    __param(1, (0, typeorm_1.InjectRepository)(time_log_entity_1.TimeLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        events_gateway_1.EventsGateway])
], TrackingService);
//# sourceMappingURL=tracking.service.js.map