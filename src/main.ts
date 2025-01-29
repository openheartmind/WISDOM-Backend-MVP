import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {



  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const logger = new Logger('Main');

  const config = new DocumentBuilder()
  .setTitle('OHM')
  .setDescription('OHM BACKEND')
  .setVersion('1.0')
  .addTag('production')
  .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, documentFactory);
  await app.listen(configService.get("PORT") as number);
  //Provide the ipv4 address of the server
  logger.log(`Listening on ${await app.getUrl()}`);
}
bootstrap();
