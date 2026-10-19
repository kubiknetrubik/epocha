import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class RegisterDto {
  @ApiProperty({ example: 'pupa', minLength: 3, maxLength: 20 })
  @Transform(trim)
  @IsString()
  @MinLength(3, { message: 'Логин не короче 3 символов' })
  @MaxLength(20, { message: 'Логин не длиннее 20 символов' })
  username: string;

  @ApiProperty({ example: 'lupa', minLength: 4 })
  @IsString()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(4, { message: 'Пароль не короче 4 символов' })
  @MaxLength(100)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'pupa' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Логин обязателен' })
  username: string;

  @ApiProperty({ example: 'lupa' })
  @IsString()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 2 }) id: number;
  @ApiProperty({ example: 'pupa' }) username: string;
}

export class MessageDto {
  @ApiProperty({ example: 'Сессия завершена' }) message: string;
}
