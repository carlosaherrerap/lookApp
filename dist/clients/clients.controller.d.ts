import { ClientsService } from './clients.service';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    update(id: string, updateData: any): Promise<import("./entities/client.entity").Client>;
}
