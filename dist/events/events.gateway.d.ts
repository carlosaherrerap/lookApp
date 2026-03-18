import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    identity(client: Socket, data: number): Promise<number>;
    emitTrackingUpdate(data: any): void;
    emitReportUpdate(data: any): void;
}
