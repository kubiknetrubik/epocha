import { Module } from '@nestjs/common';
import { EpochaController } from './epocha/epocha.controller';
import { EpochaModule } from './epocha/epocha.module';
import { EpochaService } from './epocha/epocha.service';

@Module({
  imports: [EpochaModule],
  controllers: [EpochaController],
  providers: [EpochaService],
})
export class AppModule {}
