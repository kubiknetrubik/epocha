import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, Like, MoreThanOrEqual} from 'typeorm'; // Исправлены импорты!
import { InjectRepository} from '@nestjs/typeorm';
import { ArchaismDicts, DictStatus } from './entities/archaism_dict.entity';
import { DictLikes } from './entities/dict_like.entity';


@Injectable()
export class ArchaismDictsService {
    private readonly DEFAULT_IMAGE = '/basepicture.jpg';
    private readonly DEFAULT_VIDEO = '/basevideo.mp4';

    constructor(
        @InjectRepository(ArchaismDicts)
        private dictRepository: Repository<ArchaismDicts>,
        @InjectRepository(DictLikes)
        private likeRepository: Repository<DictLikes>,
    ) {}

    private applyDefaultMedia(dict: any) {
        if (!dict) return null;
        return {
            ...dict,
            imageUrl: dict.imageUrl && dict.imageUrl.trim() !== '' ? dict.imageUrl : this.DEFAULT_IMAGE,
            videoUrl: dict.videoUrl && dict.videoUrl.trim() !== '' ? dict.videoUrl : this.DEFAULT_VIDEO,
        };
    }

    async getPublishedDicts(startDateFilter?: string) {
        const whereCondition: any = { status: DictStatus.PUBLISHED };
        if (startDateFilter && startDateFilter.trim() !== '') {
            whereCondition.startDate = MoreThanOrEqual(startDateFilter.trim());
        }

        const dicts = await this.dictRepository.find({
            where: whereCondition,
            relations: { likes: true },
            order: { createdAt: 'DESC' },
        });

        return dicts.map((d) => {
            const formatted = this.applyDefaultMedia(d);
            return {
                ...formatted,
                likesCount: d.likes ? d.likes.length : 0,
            };
        });
    }

    async getUserDraft(userId: number) {
        const draft = await this.dictRepository.findOne({
            where: { userId, status: DictStatus.DRAFT },
        });
        if (!draft) {
            return null;
        }
        return this.applyDefaultMedia(draft);
    }

    async getServiceById(id: number) {
        const dict = await this.dictRepository.findOne({
            where: { id },
            relations: { likes: true },
        });
        if (!dict || dict.status === DictStatus.DELETED) {
            throw new NotFoundException(`Словарь с ID ${id} не найден или удален`);
        }

        const formatted = this.applyDefaultMedia(dict);
        return {
            ...formatted,
            likesCount: dict.likes ? dict.likes.length : 0,
        };
    }

    async getOrCreateDraft(
        userId: number,
        data: { title?: string; description?: string; startDate?: string; endDate?: string; imageUrl?: string; videoUrl?: string },
    ) {
        let draft = await this.dictRepository.findOne({
            where: { userId, status: DictStatus.DRAFT },
        });
        const parseDate = (dateStr?: string) => {
            return dateStr && dateStr.trim() !== '' ? dateStr : null;
        };
        if (!draft) {
            draft = this.dictRepository.create({
                title: data.title && data.title.trim() !== '' ? data.title : 'Новый словарь (Черновик)',
                description: data.description || '',
                startDate: parseDate(data.startDate),
                endDate: parseDate(data.endDate),
                imageUrl: '',
                videoUrl: '',
                status: DictStatus.DRAFT,
                userId: userId,
            });
        }else{
            if (data.title !== undefined) draft.title = data.title;
            if (data.description !== undefined) draft.description = data.description;
            if (data.startDate !== undefined) draft.startDate = data.startDate;
            if (data.endDate !== undefined) draft.endDate = data.endDate;
            if (data.imageUrl !== undefined) draft.imageUrl = data.imageUrl;
            if (data.videoUrl !== undefined) draft.videoUrl = data.videoUrl;
        }
        draft = await this.dictRepository.save(draft);
        return this.applyDefaultMedia(draft);
    }

    async publishService(
        id: number,
        data: { title: string; description: string; startDate: string; endDate: string },
    ) {
        const dict = await this.dictRepository.findOne({ where: { id } });

        if (!dict || dict.status === DictStatus.DELETED) {
            throw new NotFoundException(`Словарь с ID ${id} не найден или удален`);
        }

        dict.title = data.title;
        dict.description = data.description;
        dict.startDate = data.startDate;
        dict.endDate = data.endDate;
        dict.status = DictStatus.PUBLISHED;
        dict.publishedAt = new Date();

        const saved = await this.dictRepository.save(dict);
        return this.applyDefaultMedia(saved);
    }

    async deleteServiceViaCursor(id: number, userId: number): Promise<{ message: string }> {
        try {
            await this.dictRepository.query(`BEGIN`);

            await this.dictRepository.query(
                `DECLARE delete_cursor CURSOR FOR 
                SELECT id FROM archaism_dicts 
                WHERE id = $1 AND "userId" = $2 AND status != 'deleted'`,
                [id, userId],
            );

            const rows = await this.dictRepository.query(`FETCH NEXT FROM delete_cursor`);

            if (!rows || rows.length === 0) {
                await this.dictRepository.query(`CLOSE delete_cursor`);
                await this.dictRepository.query(`ROLLBACK`);
                throw new NotFoundException(`Заявка с ID ${id} не найдена или уже была удалена`);
            }

            await this.dictRepository.query(
                `UPDATE archaism_dicts 
                SET status = $1, "publishedAt" = NULL
                WHERE id = $2`,
                [DictStatus.DELETED, id],
            );

            await this.dictRepository.query(`CLOSE delete_cursor`);
            await this.dictRepository.query(`COMMIT`);

            return { message: `Заявка с ID ${id} успешно удалена через SQL-курсор` };
        } catch (err) {
            await this.dictRepository.query(`ROLLBACK`).catch(() => {});
            throw err;
        }
    }
}