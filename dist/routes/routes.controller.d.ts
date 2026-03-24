import { RoutesService } from './routes.service';
export declare class RoutesController {
    private readonly routesService;
    constructor(routesService: RoutesService);
    create(createRouteDto: any): Promise<import("./entities/route.entity").Route>;
    findByWorker(req: any): Promise<import("./entities/route.entity").Route[]>;
    findAll(): Promise<import("./entities/route.entity").Route[]>;
    findOne(id: string): Promise<import("./entities/route.entity").Route | null>;
    update(id: string, updateRouteDto: any): Promise<import("./entities/route.entity").Route>;
}
