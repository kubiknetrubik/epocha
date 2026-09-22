import { Controller, Get, Post, Body, Param, Query, Render, Redirect, ParseIntPipe } from '@nestjs/common';
import { ArchaismDictsService } from './epocha.service';

const DEFAULT_USER_ID = 1;

@Controller('archaism-dicts-feed')
export class ArchaismDictsFeedController {
    constructor(private readonly archaismDictsService: ArchaismDictsService) {}

    @Get(['', '/'])
    @Render('archaismdictsfeed')
    async getFeedPage(@Query('id') id?: string) {
        const published = await this.archaismDictsService.getPublishedDicts();

        const currentIndex = id ? published.findIndex(p => p.id === parseInt(id, 10)) : 0;
        const currentDict = published[currentIndex >= 0 ? currentIndex : 0];

        if (!currentDict) {
            return { isHome: true, dict: null, likesCount: 0, nextDictId: null };
        }

        const nextIndex = (currentIndex + 1) % published.length;
        const nextDictId = published[nextIndex]?.id || currentDict.id;

        return {
            isHome: true,
            dict: currentDict,
            likesCount: currentDict.likesCount,
            nextDictId,
            published,
        };
    }
}

@Controller('archaism-dicts-edit')
export class ArchaismDictsEditorController {
    constructor(private readonly archaismDictsService: ArchaismDictsService) {}

    @Get()
    @Render('archaismdictsedit')
    async getEditPage() {
        const draftDict = await this.archaismDictsService.getUserDraft(DEFAULT_USER_ID);
        const hasdraft = Boolean(draftDict);

        const defaultForm = {
            title: '',
            imageUrl: '/basepicture.jpg',
            videoUrl: '/basevideo.mp4',
        };

        return {
            isAdd: true,
            hasDraft: hasdraft,
            dict: draftDict || defaultForm,
        };
    }

    @Post('create-draft')
    @Redirect('/archaism-dicts-edit', 302)
    async createDraft(
        @Body() body: { title?: string; imageUrl?: string; videoUrl?: string }
    ) {
        await this.archaismDictsService.getOrCreateDraft(DEFAULT_USER_ID, {
            title: body.title,
            imageUrl: body.imageUrl,
            videoUrl: body.videoUrl,
        });
    }

    @Post('publish/:id')
    @Redirect('/archaism-dicts-feed', 302)
    async publishCard(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { 
            title: string; 
            imageUrl?: string;
            videoUrl?: string;
            description: string; 
            startDate: string; 
            endDate: string;
        },
    ) {
        await this.archaismDictsService.publishService(id, body);
    }
}

@Controller('archaism-dicts-catalog')
export class ArchaismDictsCatalogController {
    constructor(private readonly archaismDictsService: ArchaismDictsService) {}

    @Get()
    @Render('archaismdictscatalog')
    async getCatalogPage(@Query('startDateFilter') startDateFilter?: string) {
        const archaismDicts = await this.archaismDictsService.getPublishedDicts(startDateFilter);

        return {
            isAbout: true,
            archaismDicts,
            startDateFilter: startDateFilter || '',
            currentUserId: DEFAULT_USER_ID,
        };
    }

    @Post('delete-cursor/:id')
    @Redirect('/archaism-dicts-catalog', 302)
    async deleteViaCursor(@Param('id', ParseIntPipe) id: number) {
        await this.archaismDictsService.deleteServiceViaCursor(id, DEFAULT_USER_ID);
    }
}