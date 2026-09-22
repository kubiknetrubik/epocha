import { Module } from '@nestjs/common';
import { ArchaismDictsFeedController, ArchaismDictsEditorController, ArchaismDictsCatalogController} from './epocha/epocha.controller';
import { EpochaModule } from './epocha/epocha.module';
import { ArchaismDictsService } from './epocha/epocha.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [EpochaModule, ConfigModule.forRoot({isGlobal: true, envFilePath: '.env',}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
