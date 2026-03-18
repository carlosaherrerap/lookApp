import { User } from '../../users/entities/user.entity';
export declare class TimeLog {
    id: number;
    worker: User;
    type: string;
    event_timestamp: Date;
    server_timestamp: Date;
    location: any;
}
