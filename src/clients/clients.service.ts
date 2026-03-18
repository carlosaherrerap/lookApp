import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async update(id: number, updateData: any): Promise<Client> {
    const client = await this.clientsRepository.findOne({ where: { id } });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    
    Object.assign(client, updateData);
    return this.clientsRepository.save(client);
  }
}
