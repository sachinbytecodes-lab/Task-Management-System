import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Pyramid API listening on http://localhost:${port}`);
}
bootstrap();
