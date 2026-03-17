import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingHistory } from './entities/tracking-history.entity';
import { TimeLog } from './entities/time-log.entity';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(TrackingHistory)
    private readonly trackingRepository: Repository<TrackingHistory>,
    @InjectRepository(TimeLog)
    private readonly timeLogRepository: Repository<TimeLog>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async saveTrackingHistory(payload: any) {
    const log = this.trackingRepository.create({
      worker: { id: payload.worker_id },
      event_timestamp: payload.event_timestamp ? new Date(payload.event_timestamp) : new Date(),
      location: {
        type: 'Point',
        coordinates: [payload.lng, payload.lat],
      },
    });

    const savedLog = await this.trackingRepository.save(log);
    
    // Notificar al Dashboard
    this.eventsGateway.emitTrackingUpdate({
      worker_id: payload.worker_id,
      lat: payload.lat,
      lng: payload.lng,
      timestamp: savedLog.event_timestamp,
    });
    
    return savedLog;
  }

  async saveTimeLog(payload: any) {
    const timeLog = this.timeLogRepository.create({
      worker: { id: payload.worker_id },
      type: payload.type, // 'start_day', 'lunch_start', etc
      event_timestamp: payload.event_timestamp ? new Date(payload.event_timestamp) : new Date(),
    });

    if (payload.location) {
      timeLog.location = {
        type: 'Point',
        coordinates: [payload.location.lng, payload.location.lat],
      };
    }

    return await this.timeLogRepository.save(timeLog);
  }
}
