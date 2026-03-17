import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('time_logs')
export class TimeLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  worker: User;

  @Column({
    type: 'enum',
    enum: ['start_day', 'lunch_start', 'lunch_end', 'end_day'],
  })
  type: string;

  @Column({ type: 'timestamp with time zone' })
  event_timestamp: Date;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  server_timestamp: Date;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: any;
}
