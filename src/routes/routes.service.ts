import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from './entities/route.entity';
import { User } from '../users/entities/user.entity';


@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private routesRepository: Repository<Route>,
  ) {}

  async create(createRouteDto: any): Promise<Route> {
    const newRoute = this.routesRepository.create(createRouteDto as object);
    return this.routesRepository.save(newRoute as Route);
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
    const route = await this.findOne(id);
    if (!route) throw new Error('Ruta no encontrada');

    // Manejo de actualización con cascada para clientes
    const updatedRoute = this.routesRepository.merge(route, updateData);
    return this.routesRepository.save(updatedRoute);
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

