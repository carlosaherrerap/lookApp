import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Client } from '../../clients/entities/client.entity';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'date' })
  assigned_date: Date;

  @Column({
    type: 'enum',
    enum: ['planned', 'in_progress', 'completed'],
    default: 'planned',
  })
  status: string;

  @ManyToOne(() => User, (user) => user.routes)
  worker: User;

  @OneToMany(() => Client, (client) => client.route)
  clients: Client[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
