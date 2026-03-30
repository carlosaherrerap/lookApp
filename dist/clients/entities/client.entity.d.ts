import { Route } from '../../routes/entities/route.entity';
import { User } from '../../users/entities/user.entity';
import { ClientCreditInfo } from './client-credit-info.entity';
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
    current_worker: User;
    credit_info: ClientCreditInfo;
    created_at: Date;
}
