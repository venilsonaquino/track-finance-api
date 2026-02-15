import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggerService } from './config/logging/logger.service';

async function bootstrap() {
  const logger = new LoggerService();
  const start = Date.now();

  const app = await NestFactory.create(AppModule, {
    logger,
  });
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const port = process.env.PORT || 8080;
  await app.listen(port);

  const elapsedMs = Date.now() - start;
  logger.log(
    `Application is running on: http://localhost:${port} (bootstrap: ${elapsedMs}ms)`,
    'Bootstrap',
  );
}
bootstrap();
