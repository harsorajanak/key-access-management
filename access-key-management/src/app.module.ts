import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InMemoryDBModule } from '@nestjs-addons/in-memory-db';
import { JwtModule } from '@nestjs/jwt';
import { SECRET_KEY } from './constant';

@Module({
  imports: [
    InMemoryDBModule.forRoot({}),
    JwtModule.register({
      global: true,
      secret: SECRET_KEY,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
