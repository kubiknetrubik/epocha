import { Global, Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionMiddleware } from './session.middleware';
import { AuthGuard } from './auth.guard';

@Global()
@Module({
  providers: [SessionService, SessionMiddleware, AuthGuard],
  exports: [SessionService, SessionMiddleware, AuthGuard],
})
export class AuthModule {}
