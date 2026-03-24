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

  async markEnCamino(id: number): Promise<Client> {
    const client = await this.clientsRepository.findOne({ where: { id } });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    
    if (client.status === 'EN CAMINO') {
      throw new ConflictException('Ya hay un trabajador en camino a este cliente');
    }

    client.status = 'EN CAMINO';
    return this.clientsRepository.save(client);
  }

  async update(id: number, updateData: any): Promise<Client> {
    const client = await this.clientsRepository.findOne({ where: { id } });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    
    Object.assign(client, updateData);
    return this.clientsRepository.save(client);
  }
}
