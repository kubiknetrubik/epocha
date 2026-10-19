import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword, verifyPassword } from '../auth/password';
import { SessionService } from '../auth/session.service';
import { LoginDto, RegisterDto, UserResponseDto } from './user.dto';
import { Users } from './entities/user.entity';

@Injectable()
export class UsersApiService {
  constructor(
    @InjectRepository(Users) private readonly users: Repository<Users>,
    private readonly sessions: SessionService,
  ) {}

  async register(dto: RegisterDto): Promise<UserResponseDto> {
    if (await this.users.findOne({ where: { username: dto.username } })) {
      throw new ConflictException(`Логин «${dto.username}» уже занят`);
    }
    const saved = await this.users.save(
      this.users.create({ username: dto.username, password: await hashPassword(dto.password) }),
    );
    return { id: saved.id, username: saved.username };
  }

  async login(dto: LoginDto): Promise<{ sessionId: string; user: UserResponseDto }> {
    const user = await this.users.findOne({ where: { username: dto.username } });
    if (!user || !(await verifyPassword(dto.password, user.password))) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }
    const sessionId = await this.sessions.create({ id: user.id, username: user.username });
    return { sessionId, user: { id: user.id, username: user.username } };
  }

  async logout(sessionId?: string): Promise<void> {
    if (sessionId) await this.sessions.destroy(sessionId);
  }
}
