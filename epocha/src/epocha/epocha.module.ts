import { Module } from '@nestjs/common';
import { ArchaismDictsService } from './epocha.service';
import { ArchaismDictsFeedController, ArchaismDictsEditorController, ArchaismDictsCatalogController} from '../epocha/epocha.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { ArchaismDicts } from './entities/archaism_dict.entity';
import { DictLikes } from './entities/dict_like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, ArchaismDicts, DictLikes]),
  ],
  controllers: [ArchaismDictsFeedController, ArchaismDictsEditorController, ArchaismDictsCatalogController],
  providers: [ArchaismDictsService],
})
export class EpochaModule {}
