import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Route } from '../../routes/entities/route.entity';

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
  location: any; // Se manejará como un objeto GeoJSON { type: 'Point', coordinates: [lng, lat] }

  @Column({ nullable: true })
  visit_order: number;

  @Column({
    type: 'enum',
    enum: ['pendiente', 'visitado', 'ausente', 'abandonado', 'otro'],
    default: 'pendiente',
  })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  collected_data: any;

  @ManyToOne(() => Route, (route) => route.clients, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
