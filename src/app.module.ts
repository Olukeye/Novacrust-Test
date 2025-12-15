import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true
    }),
  //   AuthModule,
    PrismaModule,
  //   MailModule,
  //   UserModule,
  ],
})
export class AppModule {}
