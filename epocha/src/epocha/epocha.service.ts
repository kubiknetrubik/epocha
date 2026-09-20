import { Injectable, NotFoundException } from '@nestjs/common';

enum DictStatus {
    draft = 0,
    published,
    deleted,
};

export interface ArchaismDict {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  lowlimit: number;
  highlimit: number;
  status: DictStatus;
}

export interface Like{
    id: number;
    userId: number;
    dictId: number;
}

@Injectable()
export class ArchaismDictsService {
    private readonly minioUrl = 'http://localhost:9000/media';
    private dicts: ArchaismDict[] = [
    {
        "id": 1,
        "title": "Словарь архаизмов и терминов Петровской эпохи",
        "description": "Свод заимствований и неологизмов начала XVIII века: морские термины, чины Табели о рангах",
        "imageUrl": `${this.minioUrl}/1.jpg`,
        "videoUrl": `${this.minioUrl}/1_vid.mp4`,
        "lowlimit": 1700,
        "highlimit": 1725,
        "status": DictStatus.published
    },
    {
        "id": 2,
        "title": "Словарь русского языка XI–XVII веков",
        "description": "Исторический словарь лексики древнерусского периода: старославянизмы, устаревшие названия частей тела и быта",
        "imageUrl": `${this.minioUrl}/2.jpg`,
        "videoUrl": `${this.minioUrl}/2_vid.mp4`,
        "lowlimit": 1000,
        "highlimit": 1699,
        "status": DictStatus.published
    },
    {
        "id": 3,
        "title": "Словарь лексики Пушкинской поры и XIX века",
        "description": "Аналитический модуль для текстов XIX века: дворянский быт, общественные институты и карамзинизмы (конкорс, боливар, оброк, гусар).",
        "imageUrl": `${this.minioUrl}/3.jpg`,
        "videoUrl": `${this.minioUrl}/3_vid.mp4`,
        "lowlimit": 1800,
        "highlimit": 1899,
        "status": DictStatus.published
    },
    {
        "id": 4,
        "title": "Корпус неологизмов Серебряного века",
        "description": "Словарь авторских неологизмов и поэтических архаизмов поэтов-символистов и футуристов",
        "imageUrl": `${this.minioUrl}/4.jpg`,
        "videoUrl": `${this.minioUrl}/4_vid.mp4`,
        "lowlimit": 1890,
        "highlimit": 1920,
        "status": DictStatus.deleted
    },
    {
        "id": 5,
        "title": "Словарь обиходного русского языка Московской Руси",
        "description": "Разговорно-бытовая лексика и грамоты XVI–XVII веков: наименования одежды, утвари, монет и бытовых обрядов (челобитная, алтын, кафтан, ямщик).",
        "imageUrl": `${this.minioUrl}/5.jpg`,
        "videoUrl": `${this.minioUrl}/5_vid.mp4`,
        "lowlimit": 1500,
        "highlimit": 1699,
        "status": DictStatus.draft
    }
    ];
    private likes: Like[] = [
    { id: 1, userId: 1, dictId: 1 },
    { id: 2, userId: 1, dictId: 2 },
    { id: 3, userId: 3, dictId: 3 },
    { id: 4, userId: 2, dictId: 3 }
    ];

    getPublishedDicts(): ArchaismDict[] {
        return this.dicts.filter((d) => d.status === DictStatus.published);
    }

    getDraftedDicts(): ArchaismDict[] {
        return this.dicts.filter((d) => d.status === DictStatus.draft);
    }

    getDictById(id: number): ArchaismDict | undefined {
        return this.dicts.find(
            (d) => d.id === id && d.status === DictStatus.published,
        );
    }

    getNextDictId(currentId: number): number {
        const published = this.getPublishedDicts();
        if (published.length === 0) return currentId;

        const currentIndex = published.findIndex((d) => d.id === currentId);
        if (currentIndex === -1 || currentIndex === published.length - 1) {
            return published[0].id;
        }
        return published[currentIndex + 1].id;
    }

    getLikesCountForDict(dictId: number): number {
        return this.likes.filter((l) => l.dictId === dictId).length;
    }

    getPublishedGrid(lowlimit?: string): ArchaismDict[] {
        let list = this.getPublishedDicts();

        if (lowlimit && lowlimit.trim() !== '') {
            const limitNum = parseInt(lowlimit, 10);
            if (!isNaN(limitNum)) {
                list = list.filter((dict) => dict.lowlimit >= limitNum);
            }
        }     

        return list.map((dict) => ({
            ...dict,
            likes: this.getLikesCountForDict(dict.id),
        }));
    }
    
}
