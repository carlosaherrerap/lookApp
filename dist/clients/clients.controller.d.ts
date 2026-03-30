import { ClientsService } from './clients.service';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    getMundo(): Promise<import("./entities/client.entity").Client[]>;
    getActive(req: any): Promise<import("./entities/client.entity").Client | null>;
    markEnCamino(id: string, req: any): Promise<import("./entities/client.entity").Client>;
    update(id: string, updateData: any): Promise<import("./entities/client.entity").Client>;
}
