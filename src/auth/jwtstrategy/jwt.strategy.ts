import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private auth: AuthService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:configService.get<string>('JWT_SECRET')
    });
  }

  async validate(payload: any) {
    try{
      const user = await this.auth.getUserById(payload.sub);
    
      return{
        ...user
      }
                
    }catch(error){
      throw new UnauthorizedException("Invalid token")
    }
  }
}