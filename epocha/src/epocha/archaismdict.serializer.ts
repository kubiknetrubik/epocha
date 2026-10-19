import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ArchaismDicts, DictStatus } from './entities/archaism_dict.entity';
import { MinioService } from './minio.service';

export class DictListItemDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 'Словарь Даля' }) title: string;
  @ApiProperty({ type: String, nullable: true, example: 'http://localhost:9000/media/img-1.jpg' })
  imageUrl: string | null;
  @ApiProperty({ type: String, nullable: true, example: '1863-01-01' }) startDate: string | null;
  @ApiProperty({ type: String, nullable: true, example: '1866-12-31' }) endDate: string | null;
  @ApiProperty({ example: 3 }) likesCount: number;
  @ApiProperty({ enum: [0, 1], description: '1 — создатель словаря текущий пользователь' })
  isMine: 0 | 1;
}

export class DictDetailDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 'Словарь Даля' }) title: string;
  @ApiProperty({ type: String, nullable: true }) description: string | null;
  @ApiProperty({ type: String, nullable: true }) imageUrl: string | null;
  @ApiProperty({ type: String, nullable: true }) videoUrl: string | null;
  @ApiProperty({ type: String, nullable: true, example: '1863-01-01' }) startDate: string | null;
  @ApiProperty({ type: String, nullable: true, example: '1866-12-31' }) endDate: string | null;
  @ApiProperty({ enum: DictStatus }) status: DictStatus;
  @ApiProperty({ type: Date, nullable: true }) publishedAt: Date | null;
  @ApiProperty({ example: 3 }) likesCount: number;
  @ApiProperty({ enum: [0, 1], description: '1 — текущий пользователь поставил лайк' }) liked: 0 | 1;
  @ApiProperty({ enum: [0, 1], description: '1 — создатель словаря текущий пользователь' })
  isMine: 0 | 1;
}

export class DictFeedDto extends DictDetailDto {
  @ApiProperty({ example: 2, description: 'ID следующего словаря в ленте (по кругу)' })
  nextId: number;
}

@Injectable()
export class DictSerializer {
  constructor(private readonly minio: MinioService) {}

  list(d: ArchaismDicts, userId?: number): DictListItemDto {
    return {
      id: d.id,
      title: d.title,
      imageUrl: this.minio.publicUrl(d.imageUrl),
      startDate: d.startDate,
      endDate: d.endDate,
      likesCount: d.likes?.length ?? 0,
      isMine: userId !== undefined && d.userId === userId ? 1 : 0,
    };
  }

  detail(d: ArchaismDicts, userId?: number): DictDetailDto {
    return {
      id: d.id,
      title: d.title,
      description: d.description,
      imageUrl: this.minio.publicUrl(d.imageUrl),
      videoUrl: this.minio.publicUrl(d.videoUrl),
      startDate: d.startDate,
      endDate: d.endDate,
      status: d.status,
      publishedAt: d.publishedAt ?? null,
      likesCount: d.likes?.length ?? 0,
      liked: userId !== undefined && d.likes?.some((l) => l.userId === userId) ? 1 : 0,
      isMine: userId !== undefined && d.userId === userId ? 1 : 0,
    };
  }

  feed(d: ArchaismDicts, nextId: number, userId?: number): DictFeedDto {
    return { ...this.detail(d, userId), nextId };
  }
}
