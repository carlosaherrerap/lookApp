import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tracking')
@UseGuards(JwtAuthGuard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post()
  async saveTracking(@Body() payload: any, @Req() req: any) {
    payload.worker_id = req.user.userId;
    return this.trackingService.saveTrackingHistory(payload);
  }

  @Post('time-log')
  async saveTimeLog(@Body() payload: any, @Req() req: any) {
    payload.worker_id = req.user.userId;
    return this.trackingService.saveTimeLog(payload);
  }
}
