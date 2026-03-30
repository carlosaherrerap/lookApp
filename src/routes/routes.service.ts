import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from './entities/route.entity';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(createRouteDto: any): Promise<Route> {
    return await this.routesRepository.manager.transaction(async (manager) => {
      const { clients, ...routeData } = createRouteDto;
      
      // 1. Crear y guardar la ruta base
      const route = manager.create(Route, routeData as object);
      const savedRoute = await manager.save(Route, route);

      // 2. Guardar clientes manualmente
      if (clients && clients.length > 0) {
        const clientEntities = clients.map((c: any) => 
          manager.create('clients', { ...c, route: savedRoute })
        );
        await manager.save('clients', clientEntities);
      }

      // Notificar
      if (savedRoute.worker?.id) {
        this.eventsGateway.notifyRouteUpdate(savedRoute.worker.id, { type: 'create', routeId: savedRoute.id });
      }

      return this.findOne(savedRoute.id) as any;
    });
  }

  async findAll(): Promise<Route[]> {
    return this.routesRepository.find({
      relations: ['worker', 'clients'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: number): Promise<Route | null> {
    return this.routesRepository.findOne({
      where: { id },
      relations: ['worker', 'clients'],
    });
  }

  async update(id: number, updateData: any): Promise<Route> {
    return await this.routesRepository.manager.transaction(async (manager) => {
      const route = await manager.findOne(Route, {
        where: { id },
        relations: ['worker', 'clients'],
      });
      
      if (!route) throw new Error('Ruta no encontrada');

      const { clients: inputClients, ...routeFields } = updateData;

      // 1. Manejo de sincronización de clientes (Pines)
      if (inputClients) {
        // IDs que vienen en el payload para conservar
        const inputClientIds = inputClients
          .filter((c: any) => c.id)
          .map((c: any) => Number(c.id));
        
        // Clientes actuales en BD que NO están en el payload (Orphans)
        const clientsToDelete = route.clients
          .filter(c => !inputClientIds.includes(Number(c.id)))
          .map(c => c.id);

        if (clientsToDelete.length > 0) {
          await manager.delete('clients', clientsToDelete);
        }

        // 2. Sincronizar clientes (Actualizar asistentes y Crear nuevos)
        // Usamos manager.save en lugar de update para que TypeORM maneje correctamente los objetos de Geometría PostGIS
        for (const c of inputClients) {
          const clientData = {
            ...c,
            route: route // Asegurar asociación con la ruta actual
          };

          if (c.id) {
            // Actualizar existente (merge automático por ID)
            await manager.save('clients', clientData);
          } else {
            // Crear nuevo
            const newClient = manager.create('clients', clientData);
            await manager.save('clients', newClient);
          }
        }
      }

      // 3. Actualizar campos de la ruta
      manager.merge(Route, route, routeFields);
      const saved = await manager.save(Route, route);

      // 4. Notificación de tiempo real
      if (saved.worker?.id) {
        this.eventsGateway.notifyRouteUpdate(saved.worker.id, { type: 'update', routeId: saved.id });
      }

      return this.findOne(saved.id) as any;
    });
  }
  // New method to fetch routes for a specific worker
  async findByWorker(workerId: number): Promise<Route[]> {
    return this.routesRepository.find({
      where: { worker: { id: workerId } },
      relations: ['worker', 'clients'],
      order: { created_at: 'DESC' },
    });
  }
}

