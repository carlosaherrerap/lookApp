export declare class SyncService {
    static queueReport(type: 'visit_report' | 'time_log' | 'tracking', payload: any): Promise<void>;
    static syncAll(): Promise<void>;
}
