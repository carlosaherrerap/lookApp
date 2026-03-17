import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tracking')
@UseGuards(JwtAuthGuard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post()
  async saveTracking(@Body() payload: any) {
    return this.trackingService.saveTrackingHistory(payload);
  }

  @Post('time-log')
  async saveTimeLog(@Body() payload: any) {
    return this.trackingService.saveTimeLog(payload);
  }
}
