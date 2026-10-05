import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getCurrentUser } from '../common/current-user';
import { RegisterDto, UserResponseDto } from './user.dto';
import { Users } from './entities/user.entity';

@Injectable()
export class UsersApiService {
  constructor(@InjectRepository(Users) private readonly users: Repository<Users>) {}

  async register(dto: RegisterDto): Promise<UserResponseDto> {
    if (await this.users.findOne({ where: { username: dto.username } })) {
      throw new ConflictException(`Логин «${dto.username}» уже занят`);
    }
    const saved = await this.users.save(
      this.users.create({ username: dto.username, password: dto.password }),
    );
    return { id: saved.id, username: saved.username };
  }

  login() {
    const { id, username } = getCurrentUser();
    return { message: 'Заглушка: аутентификация будет реализована в ЛР-4', user: { id, username } };
  }

  logout() {
    return { message: 'Заглушка: деавторизация будет реализована в ЛР-4' };
  }
}
