import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: any): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userData.password || userData.password_hash, salt);
    const newUser = this.usersRepository.create({
      ...userData,
      password_hash: hashedPassword,
      role: userData.role || 'worker',
    });
    return this.usersRepository.save(newUser) as unknown as Promise<User>;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findWorkers(search?: string): Promise<User[]> {
    const query = this.usersRepository.createQueryBuilder('user')
      .where('user.role = :role', { role: 'worker' })
      .select(['user.id', 'user.email', 'user.name', 'user.role', 'user.created_at']);

    if (search) {
      query.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` });
    }

    return query.getMany();
  }
}
