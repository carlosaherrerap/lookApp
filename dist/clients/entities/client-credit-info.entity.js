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
exports.ClientCreditInfo = void 0;
const typeorm_1 = require("typeorm");
const client_entity_1 = require("./client.entity");
let ClientCreditInfo = class ClientCreditInfo {
    client_id;
    client;
    tipo_credito;
    fecha_desembolso;
    monto_desembolso;
    moneda;
    nro_cuotas;
    nro_cuotas_pagadas;
    monto_cuota;
    condicion_contable;
    saldo_capital;
    updated_at;
};
exports.ClientCreditInfo = ClientCreditInfo;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], ClientCreditInfo.prototype, "client_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => client_entity_1.Client, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", client_entity_1.Client)
], ClientCreditInfo.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ClientCreditInfo.prototype, "tipo_credito", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], ClientCreditInfo.prototype, "fecha_desembolso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ClientCreditInfo.prototype, "monto_desembolso", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", String)
], ClientCreditInfo.prototype, "moneda", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ClientCreditInfo.prototype, "nro_cuotas", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ClientCreditInfo.prototype, "nro_cuotas_pagadas", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ClientCreditInfo.prototype, "monto_cuota", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ClientCreditInfo.prototype, "condicion_contable", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ClientCreditInfo.prototype, "saldo_capital", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ClientCreditInfo.prototype, "updated_at", void 0);
exports.ClientCreditInfo = ClientCreditInfo = __decorate([
    (0, typeorm_1.Entity)('client_credit_info')
], ClientCreditInfo);
//# sourceMappingURL=client-credit-info.entity.js.map