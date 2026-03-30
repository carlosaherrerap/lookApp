import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Route } from '../../routes/entities/route.entity';
import { User } from '../../users/entities/user.entity';
import { ClientCreditInfo } from './client-credit-info.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: any;

  @Column({ nullable: true })
  visit_order: number;

  @Column({ nullable: true })
  apellido_paterno: string;

  @Column({ nullable: true })
  apellido_materno: string;

  @Column({ nullable: true })
  documento: string;

  @Column({ nullable: true })
  ubigeo: number;

  @Column({ type: 'date', nullable: true })
  fecha_visita: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'PROGRAMADO',
  })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  collected_data: any;

  @ManyToOne(() => Route, (route) => route.clients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'current_worker_id' })
  current_worker: User;

  @OneToOne(() => ClientCreditInfo, (ci) => ci.client, { eager: false })
  credit_info: ClientCreditInfo;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
