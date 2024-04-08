import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'keyManagement',
      protoPath: join(__dirname, 'protos/keys.proto'),
      url: 'localhost:5051',
    },
  });
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
