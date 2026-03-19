import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  notifyRouteUpdate(workerId: number, data: any) {
    this.server.emit(`route_updated_${workerId}`, data);
  }

  emitReportUpdate(data: any) {
    this.server.emit('report_updated', data);
  }

  emitTrackingUpdate(data: any) {
    this.server.emit('tracking_updated', data);
  }
}
