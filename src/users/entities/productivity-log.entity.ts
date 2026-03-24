import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('productivity_logs')
@Unique(['worker', 'date'])
export class ProductivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'worker_id' })
  worker: User;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date: string;

  @Column({ type: 'integer', default: 0 })
  tardanza_seconds: number;

  @Column({ type: 'integer', default: 0 })
  idle_alerts_count: number;
}
