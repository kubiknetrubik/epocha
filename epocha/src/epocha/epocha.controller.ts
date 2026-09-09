import { Controller, Get, Render, Redirect, Query } from '@nestjs/common';
import { EpochaService, Dict } from './epocha.service';
@Controller('home')
export class EpochaHomeController {
    constructor(private readonly epochaService: EpochaService) {}

    @Get(['', '/'])
    @Render('home')
    getHome(@Query('id') id?: string) {
        const published = this.epochaService.getPublishedDicts();
        const currentId = id ? parseInt(id, 10) : published[0]?.id;

        let dict = this.epochaService.getDictById(currentId);
        if (!dict) {
            dict = published[0];
        }

        const nextDictId = this.epochaService.getNextDictId(dict.id);
        const likesCount = this.epochaService.getLikesCountForDict(dict.id);

        return {
            isHome: true,
            dict,
            likesCount,
            nextDictId,
        };
    }
}

@Controller('add')
export class EpochaAddController {
    constructor(private readonly epochaService: EpochaService) {}
    
    @Get()
    @Render('add')
    getAddPage() {
        const draftDict = this.epochaService.getDraftedDicts();

        return {
            isAdd: true,
            dict: draftDict[0],
        };
    }
}

@Controller('grid')
export class EpochaGridController {
    constructor(private readonly epochaService: EpochaService) {}
    
    @Get()
    @Render('grid')
    getGridPage(@Query('lowlimit') lowlimit?: string) {
        const dicts = this.epochaService.getPublishedGrid(lowlimit);
        return {
            isAbout: true,
            dicts,
            lowlimit: lowlimit || '',
        };
    }
}
