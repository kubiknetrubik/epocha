import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
        AppModule,
  );
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', 'views/partials'));
  hbs.registerHelper('eq', (a, b) => a === b);
  hbs.registerHelper('formatDate', (value: string | Date | null) => {
    if (!value) return '—';
    const s = value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
    const [y, m, d] = s.split('-');
    return `${d}.${m}.${y}`;
  });
  app.useStaticAssets(join(__dirname, '..', 'public'));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

