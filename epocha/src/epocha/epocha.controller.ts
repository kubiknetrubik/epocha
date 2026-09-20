import { Controller, Get, Render, Redirect, Query } from '@nestjs/common';
import { ArchaismDictsService, ArchaismDict } from './epocha.service';
@Controller('archaism-dicts-feed')
export class ArchaismDictsFeedController {
    constructor(private readonly archaismDictsService: ArchaismDictsService) {}

    @Get(['', '/'])
    @Render('archaismdictsfeed')
    getFeedPage(@Query('id') id?: string) {
        const published = this.archaismDictsService.getPublishedDicts();
        const currentId = id ? parseInt(id, 10) : published[0]?.id;

        let dict = this.archaismDictsService.getDictById(currentId);
        if (!dict) {
            dict = published[0];
        }

        const nextDictId = this.archaismDictsService.getNextDictId(dict.id);
        const likesCount = this.archaismDictsService.getLikesCountForDict(dict.id);

        return {
            isHome: true,
            dict,
            likesCount,
            nextDictId,
        };
    }
}

@Controller('archaism-dicts-edit')
export class ArchaismDictsEditorController {
    constructor(private readonly archaismDictsService: ArchaismDictsService) {}
    
    @Get()
    @Render('archaismdictsedit')
    getEditPage() {
        const draftDict = this.archaismDictsService.getDraftedDicts();

        return {
            isAdd: true,
            dict: draftDict[0],
        };
    }
}

@Controller('archaism-dicts-catalog')
export class ArchaismDictsCatalogController {
    constructor(private readonly archaismDictsService: ArchaismDictsService) {}
    
    @Get()
    @Render('archaismdictscatalog')
    getCatalogPage(@Query('startDateFilter') startDateFilter?: string) {
        const archaismDicts = this.archaismDictsService.getFilteredCatalog(startDateFilter);
        return {
            isAbout: true,
            archaismDicts,
            startDateFilter: startDateFilter || '',
        };
    }
}
