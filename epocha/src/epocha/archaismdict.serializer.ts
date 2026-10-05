import { Injectable } from '@nestjs/common';
import { ArchaismDicts, DictStatus } from './entities/archaism_dict.entity';
import { MinioService } from './minio.service';

export class DictListItemDto {
  id: number;
  title: string;
  imageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  likesCount: number;
  isMine: 0 | 1;
}

export class DictDetailDto {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  videoUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  status: DictStatus;
  publishedAt: Date | null;
  likesCount: number;
  liked: 0 | 1;
  isMine: 0 | 1;
}

export class DictFeedDto extends DictDetailDto {
  nextId: number;
}

@Injectable()
export class DictSerializer {
  constructor(private readonly minio: MinioService) {}

  list(d: ArchaismDicts, userId: number): DictListItemDto {
    return {
      id: d.id,
      title: d.title,
      imageUrl: this.minio.publicUrl(d.imageUrl),
      startDate: d.startDate,
      endDate: d.endDate,
      likesCount: d.likes?.length ?? 0,
      isMine: d.userId === userId ? 1 : 0,
    };
  }

  detail(d: ArchaismDicts, userId: number): DictDetailDto {
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
      liked: d.likes?.some((l) => l.userId === userId) ? 1 : 0,
      isMine: d.userId === userId ? 1 : 0,
    };
  }

  feed(d: ArchaismDicts, userId: number, nextId: number): DictFeedDto {
    return { ...this.detail(d, userId), nextId };
  }
}
