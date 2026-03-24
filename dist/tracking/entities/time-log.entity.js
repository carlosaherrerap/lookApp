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
exports.TimeLog = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let TimeLog = class TimeLog {
    id;
    worker;
    type;
    event_timestamp;
    server_timestamp;
    location;
};
exports.TimeLog = TimeLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TimeLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], TimeLog.prototype, "worker", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['start_day', 'lunch_start', 'lunch_end', 'end_day'],
    }),
    __metadata("design:type", String)
], TimeLog.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], TimeLog.prototype, "event_timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], TimeLog.prototype, "server_timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    }),
    __metadata("design:type", Object)
], TimeLog.prototype, "location", void 0);
exports.TimeLog = TimeLog = __decorate([
    (0, typeorm_1.Entity)('time_logs')
], TimeLog);
//# sourceMappingURL=time-log.entity.js.map