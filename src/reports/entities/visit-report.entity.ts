import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { User } from '../../users/entities/user.entity';

@Entity('visit_reports')
export class VisitReport {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'worker_id' })
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

  @Column({ type: 'integer', nullable: true })
  travel_time_seconds: number;

  @Column({ type: 'integer', nullable: true })
  visit_time_seconds: number;

  @Column({ type: 'jsonb', nullable: true })
  photos: string[];

  @Column({ default: 'sincronizado' })
  sync_status: string;
}
