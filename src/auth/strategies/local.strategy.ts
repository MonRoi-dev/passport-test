import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { TokenExpiredError } from '@nestjs/jwt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const tokens = await this.authService.login(username, password);
    if (!tokens) {
      throw new UnauthorizedException();
    } else if (tokens instanceof TokenExpiredError) {
      console.log('Token expired!');
    }
    return tokens;
  }
}
