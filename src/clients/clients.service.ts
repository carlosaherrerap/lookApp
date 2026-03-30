import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async findMundo(): Promise<Client[]> {
    // Retorna todos los clientes que no han sido visitados aún (global)
    return this.clientsRepository.find({
      where: [
        { status: 'pendiente' },
        { status: 'PROGRAMADO' },
        { status: 'REPROGRAMAR' }
      ],
      relations: ['route', 'credit_info'],
      order: { created_at: 'DESC' }
    });
  }

  async markEnCamino(id: number, workerId: number): Promise<Client> {
    const client = await this.clientsRepository.findOne({ 
      where: { id },
      relations: ['current_worker']
    });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    
    // Si ya tiene un trabajador y NO es el usuario actual, bloquear
    if (client.status === 'EN CAMINO' && client.current_worker && client.current_worker.id !== workerId) {
      throw new ConflictException('Este cliente ya está siendo visitado por otro trabajador');
    }

    // SI EL TRABAJADOR ya tiene un cliente activo, liberarlo (switch)
    const activeClient = await this.clientsRepository.findOne({ 
      where: { current_worker: { id: workerId }, status: 'EN CAMINO' } 
    });
    
    if (activeClient && activeClient.id !== id) {
      activeClient.status = 'PROGRAMADO';
      activeClient.current_worker = null as any;
      await this.clientsRepository.save(activeClient);
    }

    client.status = 'EN CAMINO';
    client.current_worker = { id: workerId } as any;
    return this.clientsRepository.save(client);
  }

  async update(id: number, updateData: any): Promise<Client> {
    const client = await this.clientsRepository.findOne({ where: { id } });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    
    // Solo realizar save si hay cambios reales en los valores
    const hasChanges = Object.keys(updateData).some(key => client[key] !== updateData[key]);
    if (!hasChanges) return client;

    // Si el estado cambia de EN CAMINO a algo más, liberar al trabajador
    if (client.status === 'EN CAMINO' && updateData.status && updateData.status !== 'EN CAMINO') {
      client.current_worker = null as any;
    }

    Object.assign(client, updateData);
    return this.clientsRepository.save(client);
  }

  async findActiveByWorker(workerId: number): Promise<Client | null> {
    return this.clientsRepository.findOne({
      where: { current_worker: { id: workerId }, status: 'EN CAMINO' },
      relations: ['credit_info']
    });
  }
}
