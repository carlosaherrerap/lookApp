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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitReport = void 0;
const typeorm_1 = require("typeorm");
const client_entity_1 = require("../../clients/entities/client.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let VisitReport = class VisitReport {
    id;
    client;
    worker;
    data;
    event_timestamp;
    server_timestamp;
    location_at_report;
    sync_status;
};
exports.VisitReport = VisitReport;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VisitReport.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => client_entity_1.Client),
    __metadata("design:type", client_entity_1.Client)
], VisitReport.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], VisitReport.prototype, "worker", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], VisitReport.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], VisitReport.prototype, "event_timestamp", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], VisitReport.prototype, "server_timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    }),
    __metadata("design:type", Object)
], VisitReport.prototype, "location_at_report", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'synced' }),
    __metadata("design:type", String)
], VisitReport.prototype, "sync_status", void 0);
exports.VisitReport = VisitReport = __decorate([
    (0, typeorm_1.Entity)('visit_reports')
], VisitReport);
//# sourceMappingURL=visit-report.entity.js.map