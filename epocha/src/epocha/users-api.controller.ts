import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { SESSION_COOKIE } from '../auth/session.middleware';
import type { RequestWithUser } from '../auth/session.middleware';
import { SessionService } from '../auth/session.service';
import { LoginDto, MessageDto, RegisterDto, UserResponseDto } from './user.dto';
import { UsersApiService } from './users-api.service';

@ApiTags('Пользователи')
@Controller('users')
export class UsersApiController {
  constructor(
    private readonly service: UsersApiService,
    private readonly sessions: SessionService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiConflictResponse({ description: 'Логин уже занят' })
  register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Аутентификация: создаёт сессию в Redis и ставит куку sessionId',
    description: 'Ответ содержит заголовок Set-Cookie: sessionId=…; HttpOnly.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Неверный логин или пароль' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { sessionId, user } = await this.service.login(dto);
    res.cookie(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: this.sessions.ttlSec * 1000,
    });
    return user;
  }

  @Post('logout')
  @HttpCode(200)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Деавторизация: удаляет сессию из Redis и куку' })
  @ApiOkResponse({ type: MessageDto })
  async logout(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response) {
    await this.service.logout(req.cookies?.[SESSION_COOKIE]);
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    return { message: 'Сессия завершена' };
  }
}
