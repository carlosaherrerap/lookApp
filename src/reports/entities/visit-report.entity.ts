import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { User } from '../../users/entities/user.entity';

@Entity('visit_reports')
export class VisitReport {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client)
  client: Client;

  @ManyToOne(() => User)
  worker: User;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ type: 'timestamp with time zone' })
  event_timestamp: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  server_timestamp: Date;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location_at_report: any;

  @Column({ default: 'synced' })
  sync_status: string;
}
