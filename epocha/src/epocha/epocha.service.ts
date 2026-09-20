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
  startDate: string;
  endDate: string;
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
        "description": "Свод заимствований и неологизмов начала XVIII века. Включает подробные морские термины, чины Табели о рангах, административную лексику, а также описания бытовых новшеств и ассамблей. Настоящий академический справочник по реформам Петра Великого.",
        "imageUrl": `${this.minioUrl}/1.jpg`,
        "videoUrl": `${this.minioUrl}/1_vid.mp4`,
        "startDate": '1700-01-01',
        "endDate": '1725-12-31',
        "status": DictStatus.published
    },
    {
        "id": 2,
        "title": "Словарь русского языка XI–XVII веков",
        "description": "Исторический словарь лексики древнерусского периода: старославянизмы, устаревшие названия частей тела, предметов быта и одежды. Содержит толкование старых грамот, берестяных писем и летописных сводов для глубокого погружения в историю языка.",
        "imageUrl": `${this.minioUrl}/2.jpg`,
        "videoUrl": `${this.minioUrl}/2_vid.mp4`,
        "startDate": '1000-01-01',
        "endDate": '1699-12-31',
        "status": DictStatus.published
    },
    {
        "id": 3,
        "title": "Словарь лексики Пушкинской поры и XIX века",
        "description": "Аналитический модуль для текстов XIX века: дворянский быт, общественные институты и карамзинизмы (конкорс, боливар, оброк, гусар). Помогает разобраться в нюансах поэтической и прозаической речи поэтов Золотого века русской литературы.",
        "imageUrl": `${this.minioUrl}/3.jpg`,
        "videoUrl": `${this.minioUrl}/3_vid.mp4`,
        "startDate": '1800-01-01',
        "endDate": '1899-12-31',
        "status": DictStatus.published
    },
    {
        "id": 4,
        "title": "Корпус неологизмов Серебряного века",
        "description": "Специализированный словарь авторских неологизмов, поэтических архаизмов и окказионализмов поэтов-символистов, акмеистов и футуристов. Содержит речевые эксперименты Хлебникова, Маяковского, Северянина и других ключевых авторов эпохи.",
        "imageUrl": `${this.minioUrl}/4.jpg`,
        "videoUrl": `${this.minioUrl}/4_vid.mp4`,
        "startDate": '1890-01-01',
        "endDate": '1920-12-31',
        "status": DictStatus.deleted
    },
    {
        "id": 5,
        "title": "Словарь обиходного русского языка Московской Руси",
        "description": "Разговорно-бытовая лексика, духовные и челобитные грамоты XVI–XVII веков: точные наименования традиционной одежды, домашней утвари, монет, таможенных пошлин и бытовых обрядов (челобитная, алтын, кафтан, ямщик, посох).",
        "imageUrl": `${this.minioUrl}/5.jpg`,
        "videoUrl": `${this.minioUrl}/5_vid.mp4`,
        "startDate": '1500-01-01',
        "endDate": '1699-12-31',
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

    getFilteredCatalog(startDateFilter?: string): ArchaismDict[] {
        let list = this.getPublishedDicts();

        if (startDateFilter && startDateFilter.trim() !== '') {
            list = list.filter((dict) => dict.startDate >= startDateFilter);
        }

        return list.map((dict) => ({
            ...dict,
            likes: this.getLikesCountForDict(dict.id),
        }));
    }
    
}
