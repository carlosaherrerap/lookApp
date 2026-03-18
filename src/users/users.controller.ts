import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() userData: any) {
    return this.usersService.create(userData);
  }

  @Get('workers')
  getWorkers(@Query('search') search?: string) {
    return this.usersService.findWorkers(search);
  }
}
