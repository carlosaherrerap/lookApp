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
exports.RoutesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const route_entity_1 = require("./entities/route.entity");
const events_gateway_1 = require("../events/events.gateway");
let RoutesService = class RoutesService {
    routesRepository;
    eventsGateway;
    constructor(routesRepository, eventsGateway) {
        this.routesRepository = routesRepository;
        this.eventsGateway = eventsGateway;
    }
    async create(createRouteDto) {
        return await this.routesRepository.manager.transaction(async (manager) => {
            const { clients, ...routeData } = createRouteDto;
            const route = manager.create(route_entity_1.Route, routeData);
            const savedRoute = await manager.save(route_entity_1.Route, route);
            if (clients && clients.length > 0) {
                const clientEntities = clients.map((c) => manager.create('clients', { ...c, route: savedRoute }));
                await manager.save('clients', clientEntities);
            }
            if (savedRoute.worker?.id) {
                this.eventsGateway.notifyRouteUpdate(savedRoute.worker.id, { type: 'create', routeId: savedRoute.id });
            }
            return this.findOne(savedRoute.id);
        });
    }
    async findAll() {
        return this.routesRepository.find({
            relations: ['worker', 'clients'],
            order: { created_at: 'DESC' }
        });
    }
    async findOne(id) {
        return this.routesRepository.findOne({
            where: { id },
            relations: ['worker', 'clients'],
        });
    }
    async update(id, updateData) {
        return await this.routesRepository.manager.transaction(async (manager) => {
            const route = await manager.findOne(route_entity_1.Route, {
                where: { id },
                relations: ['worker', 'clients'],
            });
            if (!route)
                throw new Error('Ruta no encontrada');
            const { clients: inputClients, ...routeFields } = updateData;
            if (inputClients) {
                const inputClientIds = inputClients
                    .filter((c) => c.id)
                    .map((c) => Number(c.id));
                const clientsToDeleteResource = route.clients
                    .filter(c => !inputClientIds.includes(Number(c.id)))
                    .map(c => c.id);
                if (clientsToDeleteResource.length > 0) {
                    await manager.delete('clients', clientsToDeleteResource);
                }
                for (const c of inputClients) {
                    if (c.id) {
                        await manager.update('clients', c.id, {
                            name: c.name,
                            address: c.address,
                            description: c.description,
                            location: c.location,
                            visit_order: c.visit_order,
                            route: route
                        });
                    }
                    else {
                        const newClient = manager.create('clients', { ...c, route: route });
                        await manager.save('clients', newClient);
                    }
                }
            }
            manager.merge(route_entity_1.Route, route, routeFields);
            const saved = await manager.save(route_entity_1.Route, route);
            if (saved.worker?.id) {
                this.eventsGateway.notifyRouteUpdate(saved.worker.id, { type: 'update', routeId: saved.id });
            }
            return this.findOne(saved.id);
        });
    }
    async findByWorker(workerId) {
        return this.routesRepository.find({
            where: { worker: { id: workerId } },
            relations: ['worker', 'clients'],
            order: { created_at: 'DESC' },
        });
    }
};
exports.RoutesService = RoutesService;
exports.RoutesService = RoutesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(route_entity_1.Route)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        events_gateway_1.EventsGateway])
], RoutesService);
//# sourceMappingURL=routes.service.js.map