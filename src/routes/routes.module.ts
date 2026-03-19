import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { Route } from './entities/route.entity';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([Route]), EventsModule],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService]
})
export class RoutesModule {}
