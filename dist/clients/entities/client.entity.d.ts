import { Route } from '../../routes/entities/route.entity';
export declare class Client {
    id: number;
    name: string;
    address: string;
    description: string;
    location: any;
    visit_order: number;
    apellido_paterno: string;
    apellido_materno: string;
    documento: string;
    ubigeo: number;
    fecha_visita: string;
    status: string;
    collected_data: any;
    route: Route;
    created_at: Date;
}
