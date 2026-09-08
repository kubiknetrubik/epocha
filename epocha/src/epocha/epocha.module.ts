import { Module } from '@nestjs/common';
import { EpochaService } from './epocha.service';

@Module({
  providers: [EpochaService]
})
export class EpochaModule {}
