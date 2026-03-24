import { Route } from '../../routes/entities/route.entity';
export declare class User {
    id: number;
    email: string;
    password_hash: string;
    name: string;
    role: string;
    routes: Route[];
    created_at: Date;
    updated_at: Date;
}
