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
exports.Route = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const client_entity_1 = require("../../clients/entities/client.entity");
let Route = class Route {
    id;
    name;
    assigned_date;
    status;
    worker;
    clients;
    created_at;
    updated_at;
};
exports.Route = Route;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Route.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Route.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Route.prototype, "assigned_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['planeado', 'en_progreso', 'completado'],
        default: 'planeado',
    }),
    __metadata("design:type", String)
], Route.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.routes),
    (0, typeorm_1.JoinColumn)({ name: 'worker_id' }),
    __metadata("design:type", user_entity_1.User)
], Route.prototype, "worker", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => client_entity_1.Client, (client) => client.route),
    __metadata("design:type", Array)
], Route.prototype, "clients", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Route.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Route.prototype, "updated_at", void 0);
exports.Route = Route = __decorate([
    (0, typeorm_1.Entity)('routes')
], Route);
//# sourceMappingURL=route.entity.js.map