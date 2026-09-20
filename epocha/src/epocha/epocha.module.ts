import { Module } from '@nestjs/common';
import { ArchaismDictsService } from './epocha.service';

@Module({
  providers: [ArchaismDictsService]
})
export class EpochaModule {}
