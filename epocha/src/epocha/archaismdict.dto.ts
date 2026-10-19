import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MSG = 'дата должна быть в формате ГГГГ-ММ-ДД';
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const emptyToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export class DictFiltersDto {
  @ApiPropertyOptional({
    example: '1700-01-01',
    description: 'Нижняя граница периода: словари с startDate >= значения',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @Matches(DATE_RE, { message: `startDate: ${DATE_MSG}` })
  startDate?: string;
}

export class FeedQueryDto {
  @ApiProperty({ example: 1, description: 'ID опубликованного словаря (обязательно)' })
  @Type(() => Number)
  @IsInt({ message: 'id обязателен и должен быть целым числом' })
  @Min(1, { message: 'id должен быть не меньше 1' })
  id: number;

  @ApiPropertyOptional({ example: true, description: 'true — вернуть словарь, следующий за id' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  next?: boolean;
}

export class CreateDictDto {
  @ApiProperty({ example: 'Словарь Даля', maxLength: 50 })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Название обязательно' })
  @MaxLength(50, { message: 'Название не длиннее 50 символов' })
  title: string;
}


export class CreateDictFormDto extends CreateDictDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Изображение: jpeg/png/webp/gif' })
  image: unknown;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Короткое видео: mp4/webm, до 50 МБ' })
  video: unknown;
}

export class PublishDictDto {
  @ApiProperty({ example: 'Толковый словарь живого великорусского языка', maxLength: 50 })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Название обязательно' })
  @MaxLength(50, { message: 'Название не длиннее 50 символов' })
  title: string;

  @ApiPropertyOptional({ example: 'Словарь В. И. Даля, около 200 000 слов' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '1863-01-01', description: 'Начало периода, ГГГГ-ММ-ДД' })
  @IsOptional()
  @Matches(DATE_RE, { message: `startDate: ${DATE_MSG}` })
  startDate?: string;

  @ApiPropertyOptional({ example: '1866-12-31', description: 'Конец периода, ГГГГ-ММ-ДД' })
  @IsOptional()
  @Matches(DATE_RE, { message: `endDate: ${DATE_MSG}` })
  endDate?: string;
}

export class LikeDictDto {
  @ApiProperty({ enum: [0, 1], example: 1, description: '1 — поставить лайк, 0 — снять' })
  @IsIn([0, 1], { message: 'like должен быть 0 или 1' })
  like: 0 | 1;
}

export class LikeResultDto {
  @ApiProperty({ example: 1 }) dictId: number;
  @ApiProperty({ enum: [0, 1], example: 1 }) liked: 0 | 1;
  @ApiProperty({ example: 3 }) likesCount: number;
}

export class DeleteResultDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 'Словарь с ID 1 удалён' }) message: string;
}