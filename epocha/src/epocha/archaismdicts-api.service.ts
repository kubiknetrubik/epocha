import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm';
import { getCurrentUser } from '../common/current-user';
import { ArchaismDicts, DictStatus } from './entities/archaism_dict.entity';
import { DictLikes } from './entities/dict_like.entity';
import { DictSerializer } from './archaismdict.serializer';
import { CreateDictDto, DictFiltersDto, LikeDictDto, PublishDictDto } from './archaismdict.dto';
import { MinioService } from './minio.service';

export interface UploadedMedia {
  image?: Express.Multer.File[];
  video?: Express.Multer.File[];
}

@Injectable()
export class DictsApiService {
  constructor(
    @InjectRepository(ArchaismDicts) private readonly dicts: Repository<ArchaismDicts>,
    @InjectRepository(DictLikes) private readonly likes: Repository<DictLikes>,
    private readonly minio: MinioService,
    private readonly serializer: DictSerializer,
  ) {}

  async list(filters: DictFiltersDto) {
    const userId = getCurrentUser().id;
    const where: FindOptionsWhere<ArchaismDicts> = { status: DictStatus.PUBLISHED };
    if (filters.startDate) where.startDate = MoreThanOrEqual(filters.startDate);

    const items = await this.dicts.find({
      where,
      relations: { likes: true },
      order: { publishedAt: 'DESC', id: 'DESC' },
    });
    return items.map((d) => this.serializer.list(d, userId));
  }

  async feed(id?: number, next = false) {
    const userId = getCurrentUser().id;
    const published = await this.dicts.find({
      where: { status: DictStatus.PUBLISHED },
      relations: { likes: true },
      order: { publishedAt: 'DESC', id: 'DESC' },
    });
    if (published.length === 0) throw new NotFoundException('Лента пуста');

    let index = 0;
    if (id !== undefined) {
      index = published.findIndex((d) => d.id === id);
      if (index < 0) throw new NotFoundException(`Словарь с ID ${id} не найден в ленте`);
      if (next) index = (index + 1) % published.length;
    }
    const nextId = published[(index + 1) % published.length].id;
    return this.serializer.feed(published[index], userId, nextId);
  }

  async getDraft() {
    const userId = getCurrentUser().id;
    const draft = await this.dicts.findOne({ where: { userId, status: DictStatus.DRAFT } });
    if (!draft) throw new NotFoundException('Черновик не найден');
    return this.serializer.detail(draft, userId);
  }

  async createDraft(dto: CreateDictDto, files: UploadedMedia) {
    const userId = getCurrentUser().id;
    const image = files?.image?.[0];
    const video = files?.video?.[0];

    const existing = await this.dicts.findOne({ where: { userId, status: DictStatus.DRAFT } });
    if (!existing && (!image || !video)) {
      throw new BadRequestException('Для нового словаря нужны файлы image и video');
    }

    const newImage = image ? await this.minio.upload(image, 'img') : undefined;
    const newVideo = video ? await this.minio.upload(video, 'vid') : undefined;
    const oldImage = existing?.imageUrl;
    const oldVideo = existing?.videoUrl;

    let saved: ArchaismDicts;
    try {
      if (existing) {
        existing.title = dto.title;
        if (newImage) existing.imageUrl = newImage;
        if (newVideo) existing.videoUrl = newVideo;
        saved = await this.dicts.save(existing);
      } else {
        saved = await this.dicts.save(
          this.dicts.create({
            title: dto.title,
            description: '',
            startDate: null,
            endDate: null,
            imageUrl: newImage,
            videoUrl: newVideo,
            status: DictStatus.DRAFT,
            userId,
          }),
        );
      }
    } catch (e) {
      await this.minio.remove(newImage);
      await this.minio.remove(newVideo);
      throw e;
    }

    if (newImage) await this.minio.remove(oldImage);
    if (newVideo) await this.minio.remove(oldVideo);
    return this.serializer.detail(saved, userId);
  }

  async publish(id: number, dto: PublishDictDto) {
    const userId = getCurrentUser().id;
    const dict = await this.getOwned(id);
    if (dict.status !== DictStatus.DRAFT) {
      throw new ConflictException('Опубликовать можно только черновик');
    }

    const startDate = dto.startDate ?? dict.startDate;
    const endDate = dto.endDate ?? dict.endDate;
    if (startDate && endDate && endDate < startDate) {
      throw new BadRequestException('Конечная дата не может быть раньше начальной');
    }

    dict.title = dto.title;
    if (dto.description !== undefined) dict.description = dto.description;
    dict.startDate = startDate;
    dict.endDate = endDate;
    dict.status = DictStatus.PUBLISHED;
    dict.publishedAt = new Date();

    return this.serializer.detail(await this.dicts.save(dict), userId);
  }

  async remove(id: number) {
    const dict = await this.getOwned(id);
    await this.dicts.update(dict.id, { status: DictStatus.DELETED });
    return { id, message: `Словарь с ID ${id} удалён` };
  }

  async setLike(id: number, dto: LikeDictDto) {
    const userId = getCurrentUser().id;
    const dict = await this.dicts.findOne({ where: { id } });
    if (!dict || dict.status !== DictStatus.PUBLISHED) {
      throw new NotFoundException(`Опубликованный словарь с ID ${id} не найден`);
    }

    const existing = await this.likes.findOne({ where: { userId, dictId: id } });
    if (dto.like === 1 && !existing) {
      await this.likes.save(this.likes.create({ userId, dictId: id }));
    } else if (dto.like === 0 && existing) {
      await this.likes.delete({ userId, dictId: id });
    }

    const likesCount = await this.likes.count({ where: { dictId: id } });
    return { dictId: id, liked: dto.like, likesCount };
  }

  private async getOwned(id: number): Promise<ArchaismDicts> {
    const dict = await this.dicts.findOne({ where: { id } });
    if (!dict || dict.status === DictStatus.DELETED) {
      throw new NotFoundException(`Словарь с ID ${id} не найден`);
    }
    if (dict.userId !== getCurrentUser().id) {
      throw new ForbiddenException('Это не ваш словарь');
    }
    return dict;
  }
}
