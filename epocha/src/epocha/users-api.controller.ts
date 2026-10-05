import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RegisterDto } from './user.dto';
import { UsersApiService } from './users-api.service';
 
@Controller('users')
export class UsersApiController {
  constructor(private readonly service: UsersApiService) {}
 
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }
 
  @Post('login')
  @HttpCode(200)
  login() {
    return this.service.login();
  }
 
  @Post('logout')
  @HttpCode(200)
  logout() {
    return this.service.logout();
  }
}