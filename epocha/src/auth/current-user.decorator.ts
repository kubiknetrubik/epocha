import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithUser } from './session.middleware';
import type { SessionUser } from './session.service';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionUser | undefined =>
    ctx.switchToHttp().getRequest<RequestWithUser>().user,
);
