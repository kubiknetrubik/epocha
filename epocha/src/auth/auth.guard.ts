import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { RequestWithUser } from './session.middleware';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    if (!req.user) {
      throw new UnauthorizedException('Требуется авторизация');
    }
    return true;
  }
}
