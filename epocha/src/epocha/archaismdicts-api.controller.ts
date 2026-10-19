import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { SessionUser } from '../auth/session.service';
import { DictsApiService } from './archaismdicts-api.service';
import type { UploadedMedia } from './archaismdicts-api.service';
import {
  CreateDictDto,
  CreateDictFormDto,
  DeleteResultDto,
  DictFiltersDto,
  FeedQueryDto,
  LikeDictDto,
  LikeResultDto,
  PublishDictDto,
} from './archaismdict.dto';
import { DictDetailDto, DictFeedDto, DictListItemDto } from './archaismdict.serializer';

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

@ApiTags('Словари архаизмов')
@Controller('dicts')
export class DictsApiController {
  constructor(private readonly service: DictsApiService) {}

  @Get()
  @ApiOperation({
    summary: 'Список опубликованных словарей с фильтром по startDate',
    description: 'Доступно гостю. Для авторизованного пользователя isMine = 1 у его словарей.',
  })
  @ApiOkResponse({ type: DictListItemDto, isArray: true })
  list(@Query() filters: DictFiltersDto, @CurrentUser() user?: SessionUser) {
    return this.service.list(filters, user?.id);
  }

  @Get('feed')
  @ApiOperation({
    summary: 'Лента: опубликованный словарь по id, с next=true — следующий за ним',
    description: 'Доступно гостю. Для авторизованного пользователя liked = 1, если он поставил лайк.',
  })
  @ApiOkResponse({ type: DictFeedDto })
  @ApiBadRequestResponse({ description: 'id не передан или не целое число ≥ 1' })
  @ApiNotFoundResponse({ description: 'Словаря нет среди опубликованных' })
  feed(@Query() query: FeedQueryDto, @CurrentUser() user?: SessionUser) {
    return this.service.feed(query.id, query.next, user?.id);
  }


  @Get('draft')
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Черновик текущего пользователя' })
  @ApiOkResponse({ type: DictDetailDto })
  @ApiUnauthorizedResponse({ description: 'Нет действующей сессии' })
  @ApiNotFoundResponse({ description: 'Черновика нет' })
  draft(@CurrentUser() user: SessionUser) {
    return this.service.getDraft(user.id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(MediaUpload)
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateDictFormDto })
  @ApiOperation({
    summary: 'Создать черновик (или обновить существующий) с изображением и видео',
    description: 'Создатель берётся из сессии. Для нового черновика оба файла обязательны.',
  })
  @ApiCreatedResponse({ type: DictDetailDto })
  @ApiUnauthorizedResponse({ description: 'Нет действующей сессии' })
  create(
    @Body() dto: CreateDictDto,
    @UploadedFiles() files: UploadedMedia,
    @CurrentUser() user: SessionUser,
  ) {
    return this.service.createDraft(dto, files, user.id);
  }

  @Put(':id/publish')
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Опубликовать свой черновик (draft → published)' })
  @ApiOkResponse({ type: DictDetailDto })
  @ApiUnauthorizedResponse({ description: 'Нет действующей сессии' })
  @ApiForbiddenResponse({ description: 'Словарь принадлежит другому пользователю' })
  @ApiConflictResponse({ description: 'Словарь не в статусе черновик' })
  publish(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PublishDictDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.service.publish(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Удалить свой словарь (soft delete: status = deleted)' })
  @ApiOkResponse({ type: DeleteResultDto })
  @ApiUnauthorizedResponse({ description: 'Нет действующей сессии' })
  @ApiForbiddenResponse({ description: 'Словарь принадлежит другому пользователю' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: SessionUser) {
    return this.service.remove(id, user.id);
  }

  @Post(':id/like')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Поставить (like = 1) или снять (like = 0) лайк' })
  @ApiOkResponse({ type: LikeResultDto })
  @ApiUnauthorizedResponse({ description: 'Нет действующей сессии' })
  like(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LikeDictDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.service.setLike(id, dto, user.id);
  }
}
