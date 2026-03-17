import { Route } from '../../routes/entities/route.entity';
export declare class Client {
    id: number;
    name: string;
    address: string;
    location: any;
    visit_order: number;
    status: string;
    route: Route;
    created_at: Date;
}
