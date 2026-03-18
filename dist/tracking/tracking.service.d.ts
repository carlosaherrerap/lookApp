import { Repository } from 'typeorm';
import { TrackingHistory } from './entities/tracking-history.entity';
import { TimeLog } from './entities/time-log.entity';
import { EventsGateway } from '../events/events.gateway';
export declare class TrackingService {
    private readonly trackingRepository;
    private readonly timeLogRepository;
    private readonly eventsGateway;
    constructor(trackingRepository: Repository<TrackingHistory>, timeLogRepository: Repository<TimeLog>, eventsGateway: EventsGateway);
    saveTrackingHistory(payload: any): Promise<TrackingHistory>;
    saveTimeLog(payload: any): Promise<TimeLog>;
}
