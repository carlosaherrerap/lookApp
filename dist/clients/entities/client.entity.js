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
exports.Client = void 0;
const typeorm_1 = require("typeorm");
const route_entity_1 = require("../../routes/entities/route.entity");
let Client = class Client {
    id;
    name;
    address;
    description;
    location;
    visit_order;
    status;
    collected_data;
    route;
    created_at;
};
exports.Client = Client;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Client.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Client.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Client.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Client.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Client.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Client.prototype, "visit_order", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pendiente', 'visitado', 'ausente', 'abandonado', 'otro'],
        default: 'pendiente',
    }),
    __metadata("design:type", String)
], Client.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Client.prototype, "collected_data", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => route_entity_1.Route, (route) => route.clients, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'route_id' }),
    __metadata("design:type", route_entity_1.Route)
], Client.prototype, "route", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Client.prototype, "created_at", void 0);
exports.Client = Client = __decorate([
    (0, typeorm_1.Entity)('clients')
], Client);
//# sourceMappingURL=client.entity.js.map