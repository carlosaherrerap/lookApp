import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
export declare class ClientsService {
    private clientsRepository;
    constructor(clientsRepository: Repository<Client>);
    findMundo(): Promise<Client[]>;
    markEnCamino(id: number, workerId: number): Promise<Client>;
    update(id: number, updateData: any): Promise<Client>;
    findActiveByWorker(workerId: number): Promise<Client | null>;
}
