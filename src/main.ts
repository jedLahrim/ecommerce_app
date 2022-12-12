import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './transform.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const service = new ConfigService();
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableCors();
  // if (process.env.NODE_ENV === 'development') {
  //   app.enableCors();
  // } else {
  //   app.enableCors({ origin: serverConfig.origin });
  //   logger.log(`Accepting requests from origin "${serverConfig.origin}"`);
  // }

  const port = service.get('PORT');
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

bootstrap();
