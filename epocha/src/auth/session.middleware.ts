import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { SessionService, SessionUser } from './session.service';

export const SESSION_COOKIE = 'sessionId';

export type RequestWithUser = Request & { user?: SessionUser; sessionId?: string };

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private readonly sessions: SessionService) {}

  async use(req: RequestWithUser, _res: Response, next: NextFunction) {
    const sessionId: string | undefined = req.cookies?.[SESSION_COOKIE];
    if (sessionId) {
      try {
        const user = await this.sessions.get(sessionId);
        if (user) {
          req.user = user;
          req.sessionId = sessionId;
        }
      } catch {

      }
    }
    next();
  }
}
