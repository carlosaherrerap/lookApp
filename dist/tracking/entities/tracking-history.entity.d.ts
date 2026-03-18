import { User } from '../../users/entities/user.entity';
export declare class TrackingHistory {
    id: number;
    worker: User;
    location: any;
    event_timestamp: Date;
    server_timestamp: Date;
}
