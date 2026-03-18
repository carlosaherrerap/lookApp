import { User } from '../../users/entities/user.entity';
import { Client } from '../../clients/entities/client.entity';
export declare class Route {
    id: number;
    name: string;
    assigned_date: Date;
    status: string;
    worker: User;
    clients: Client[];
    created_at: Date;
    updated_at: Date;
}
