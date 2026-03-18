import { Repository } from 'typeorm';
import { Route } from './entities/route.entity';
export declare class RoutesService {
    private routesRepository;
    constructor(routesRepository: Repository<Route>);
    create(createRouteDto: any): Promise<Route>;
    findAll(): Promise<Route[]>;
    findOne(id: number): Promise<Route | null>;
    update(id: number, updateData: any): Promise<Route>;
    findByWorker(workerId: number): Promise<Route[]>;
}
