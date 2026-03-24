import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(userData: any): Promise<import("./entities/user.entity").User>;
    getWorkers(search?: string): Promise<import("./entities/user.entity").User[]>;
}
