import { Client } from './client.entity';
export declare class ClientCreditInfo {
    client_id: number;
    client: Client;
    tipo_credito: string;
    fecha_desembolso: string;
    monto_desembolso: number;
    moneda: string;
    nro_cuotas: number;
    cuotas_pagadas: number;
    monto_cuota: number;
    condicion_contable: string;
    saldo_capital: number;
    updated_at: Date;
}
