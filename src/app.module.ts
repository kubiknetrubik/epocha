import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EpochaController } from './epocha/epocha.controller';
import { EpochaModule } from './epocha/epocha.module';

@Module({
  imports: [EpochaModule],
  controllers: [AppController, EpochaController],
  providers: [AppService],
})
export class AppModule {}
