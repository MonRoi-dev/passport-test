import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    username: string,
    pass: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findByName(username);

    if (!user) return null;
    const isPass = await bcrypt.compare(pass, user.password);

    if (!isPass) return null;
    const tokens = await this.generateTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async register(username: string, pass: string): Promise<User> {
    const user = await this.usersService.findByName(username);
    if (user) {
      throw new UnauthorizedException({
        message: 'User with same username exist',
      });
    } else {
      const password = await bcrypt.hash(pass, 4);
      return await this.usersService.create({
        username,
        password,
        refreshToken: '',
      });
    }
  }

  private async generateTokens(id: string, username: string) {
    const accessToken = await this.jwtService.signAsync({ id, username });
    const refreshToken = await this.jwtService.signAsync(
      { id, username },
      { expiresIn: '7d', secret: process.env.REFRESH_SECRET },
    );
    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(id: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 4);
    await this.usersService.update(id, { refreshToken: hashedRefreshToken });
  }

  async logout(id: string) {
    return await this.usersService.update(id, { refreshToken: '' });
  }

  async refreshTokens(id: string, refreshToken: string) {
    console.log(id, refreshToken);
    const user = await this.usersService.findById(id);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.generateTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async googleLogin(data) {
    if (!data) throw new UnauthorizedException();
    return data;
  }
}
