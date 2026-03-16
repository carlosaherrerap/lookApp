import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Route } from '../../routes/entities/route.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

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
    enum: ['pending', 'visited', 'absent', 'other'],
    default: 'pending',
  })
  status: string;

  @ManyToOne(() => Route, (route) => route.clients, { onDelete: 'CASCADE' })
  route: Route;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
