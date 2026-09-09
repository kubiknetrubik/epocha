import { Module } from '@nestjs/common';
import { EpochaHomeController, EpochaAddController, EpochaGridController} from './epocha/epocha.controller';
import { EpochaModule } from './epocha/epocha.module';
import { EpochaService } from './epocha/epocha.service';

@Module({
  imports: [EpochaModule],
  controllers: [EpochaHomeController, EpochaAddController, EpochaGridController],
  providers: [EpochaService],
})
export class AppModule {}
