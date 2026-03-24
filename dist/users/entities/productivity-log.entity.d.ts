import { User } from './user.entity';
export declare class ProductivityLog {
    id: number;
    worker: User;
    date: string;
    tardanza_seconds: number;
    idle_alerts_count: number;
}
