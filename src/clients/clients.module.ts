import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { ClientCreditInfo } from './entities/client-credit-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, ClientCreditInfo])],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService]
})
export class ClientsModule {}
