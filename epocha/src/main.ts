import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { SESSION_COOKIE } from './auth/session.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.enableCors({ origin: true, credentials: true });

  const config = new DocumentBuilder()
    .setTitle('Epocha API — словари архаизмов')
    .setDescription(
      'Веб-сервис публикации исторических словарей архаизмов. ' +
        'Гостю доступно только чтение (список и лента). ' +
        'Для методов создателя выполните POST /api/users/login: браузер сохранит куку sessionId, ' +
        'и Swagger будет отправлять её автоматически. ' +
        'В Insomnia/Postman передавайте её заголовком Cookie: sessionId=<значение>.',
    )
    .setVersion('4.0')
    .addCookieAuth(SESSION_COOKIE)
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config), {
    swaggerOptions: { withCredentials: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();