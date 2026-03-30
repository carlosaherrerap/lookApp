import { TrackingService } from './tracking.service';
export declare class TrackingController {
    private readonly trackingService;
    constructor(trackingService: TrackingService);
    saveTracking(payload: any, req: any): Promise<import("./entities/tracking-history.entity").TrackingHistory>;
    saveTimeLog(payload: any, req: any): Promise<import("./entities/time-log.entity").TimeLog>;
}
