import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Client } from './client.entity';

@Entity('client_credit_info')
export class ClientCreditInfo {
  @PrimaryColumn()
  client_id: number;

  @OneToOne(() => Client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ nullable: true })
  tipo_credito: string;

  @Column({ type: 'date', nullable: true })
  fecha_desembolso: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monto_desembolso: number;

  @Column({ length: 10, nullable: true })
  moneda: string;

  @Column({ nullable: true })
  nro_cuotas: number;

  @Column({ nullable: true })
  cuotas_pagadas: number; // 1:1 mapping with mobile payload

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  monto_cuota: number;

  @Column({ nullable: true })
  condicion_contable: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  saldo_capital: number;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
