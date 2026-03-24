import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { VisitReport } from './entities/visit-report.entity';
import { ClientCreditInfo } from '../clients/entities/client-credit-info.entity';
import { EventsModule } from '../events/events.module';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [TypeOrmModule.forFeature([VisitReport, ClientCreditInfo]), EventsModule, ClientsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
