import { Route } from '../../routes/entities/route.entity';
export declare class Client {
    id: number;
    name: string;
    address: string;
    description: string;
    location: any;
    visit_order: number;
    status: string;
    collected_data: any;
    route: Route;
    created_at: Date;
}
