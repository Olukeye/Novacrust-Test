import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwtstrategy/jwt.strategy';

@Module({
   imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),// default for access token
        signOptions: { expiresIn: '1d' },
      }),
    }),
    PassportModule
  ],

  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
