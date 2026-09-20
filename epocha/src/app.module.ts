import { Module } from '@nestjs/common';
import { ArchaismDictsFeedController, ArchaismDictsEditorController, ArchaismDictsCatalogController} from './epocha/epocha.controller';
import { EpochaModule } from './epocha/epocha.module';
import { ArchaismDictsService } from './epocha/epocha.service';

@Module({
  imports: [EpochaModule],
  controllers: [ArchaismDictsFeedController, ArchaismDictsEditorController, ArchaismDictsCatalogController],
  providers: [ArchaismDictsService],
})
export class AppModule {}
