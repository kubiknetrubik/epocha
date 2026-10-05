import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictsApiController } from './archaismdicts-api.controller';
import { DictsApiService } from './archaismdicts-api.service';
import { UsersApiController } from './users-api.controller';
import { UsersApiService } from './users-api.service';
import { DictSerializer } from './archaismdict.serializer';
import { MinioService } from './minio.service';
import { Users } from './entities/user.entity';
import { ArchaismDicts } from './entities/archaism_dict.entity';
import { DictLikes } from './entities/dict_like.entity';
 
@Module({
  imports: [TypeOrmModule.forFeature([Users, ArchaismDicts, DictLikes])],
  controllers: [DictsApiController, UsersApiController],
  providers: [DictsApiService, UsersApiService, DictSerializer, MinioService],
})
export class EpochaModule {}
