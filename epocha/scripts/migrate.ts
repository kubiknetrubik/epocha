import { DataSource } from 'typeorm';
import { Users } from '../src/epocha/entities/user.entity';
import { ArchaismDicts } from '../src/epocha/entities/archaism_dict.entity';
import { DictLikes } from '../src/epocha/entities/dict_like.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Users, ArchaismDicts, DictLikes],
  synchronize: true,
});

async function run() {
  await dataSource.initialize();
  await dataSource.synchronize();
  console.log('Миграции базы данных выполнены успешно.');
  await dataSource.destroy();
  process.exit(0);
}

run().catch((err) => {
  console.error('Ошибка выполнения миграции:', err);
  process.exit(1);
});