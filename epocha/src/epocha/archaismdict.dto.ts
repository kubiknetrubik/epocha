import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
 
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MSG = 'дата должна быть в формате ГГГГ-ММ-ДД';
const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const emptyToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;
 

export class DictFiltersDto {
  @IsOptional()
  @Transform(emptyToUndefined)
  @Matches(DATE_RE, { message: `startDate: ${DATE_MSG}` })
  startDate?: string;
}
 

export class FeedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'id должен быть целым числом' })
  @Min(1)
  id?: number;
 
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  next?: boolean;
}
 

export class CreateDictDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Название обязательно' })
  @MaxLength(50, { message: 'Название не длиннее 50 символов' })
  title: string;
}
 

export class PublishDictDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Название обязательно' })
  @MaxLength(50, { message: 'Название не длиннее 50 символов' })
  title: string;
 
  @IsOptional()
  @IsString()
  description?: string;
 
  @IsOptional()
  @Matches(DATE_RE, { message: `startDate: ${DATE_MSG}` })
  startDate?: string;
 
  @IsOptional()
  @Matches(DATE_RE, { message: `endDate: ${DATE_MSG}` })
  endDate?: string;
}
 

export class LikeDictDto {
  @IsIn([0, 1], { message: 'like должен быть 0 или 1' })
  like: 0 | 1;
}