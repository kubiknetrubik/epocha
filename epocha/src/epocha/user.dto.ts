import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3, { message: 'Логин не короче 3 символов' })
  @MaxLength(20, { message: 'Логин не длиннее 20 символов' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(4, { message: 'Пароль не короче 4 символов' })
  @MaxLength(255)
  password: string;
}

export class UserResponseDto {
  id: number;
  username: string;
}
