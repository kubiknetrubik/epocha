import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DictsApiService } from './archaismdicts-api.service';
import type { UploadedMedia } from './archaismdicts-api.service';
import { CreateDictDto, DictFiltersDto, FeedQueryDto, LikeDictDto, PublishDictDto } from './archaismdict.dto';
 
const MediaUpload = FileFieldsInterceptor(
  [
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ],
  {
    storage: memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ok =
        file.fieldname === 'image'
          ? /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)
          : /^video\/(mp4|webm)$/.test(file.mimetype);
      cb(ok ? null : new BadRequestException(`Недопустимый тип файла в поле ${file.fieldname}`), ok);
    },
  },
);
 

@Controller('dicts')
export class DictsApiController {
  constructor(private readonly service: DictsApiService) {}
 
  @Get()
  list(@Query() filters: DictFiltersDto) {
    return this.service.list(filters);
  }
 
  @Get('feed')
  feed(@Query() query: FeedQueryDto) {
    return this.service.feed(query.id, query.next);
  }
 
  @Get('draft')
  draft() {
    return this.service.getDraft();
  }
 
  @Post()
  @UseInterceptors(MediaUpload)
  create(@Body() dto: CreateDictDto, @UploadedFiles() files: UploadedMedia) {
    return this.service.createDraft(dto, files);
  }
 
  @Put(':id/publish')
  publish(@Param('id', ParseIntPipe) id: number, @Body() dto: PublishDictDto) {
    return this.service.publish(id, dto);
  }
 
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
 
  @Post(':id/like')
  like(@Param('id', ParseIntPipe) id: number, @Body() dto: LikeDictDto) {
    return this.service.setLike(id, dto);
  }
}