import { Repository } from 'typeorm';
import { Route } from './entities/route.entity';
import { EventsGateway } from '../events/events.gateway';
export declare class RoutesService {
    private routesRepository;
    private readonly eventsGateway;
    constructor(routesRepository: Repository<Route>, eventsGateway: EventsGateway);
    create(createRouteDto: any): Promise<Route>;
    findAll(): Promise<Route[]>;
    findOne(id: number): Promise<Route | null>;
    update(id: number, updateData: any): Promise<Route>;
    findByWorker(workerId: number): Promise<Route[]>;
}
