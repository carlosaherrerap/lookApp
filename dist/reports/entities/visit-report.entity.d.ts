import { Client } from '../../clients/entities/client.entity';
import { User } from '../../users/entities/user.entity';
export declare class VisitReport {
    id: number;
    client: Client;
    worker: User;
    data: any;
    event_timestamp: Date;
    server_timestamp: Date;
    location_at_report: any;
    travel_time_seconds: number;
    visit_time_seconds: number;
    photos: string[];
    sync_status: string;
}
