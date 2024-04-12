import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('user')
  async getUser(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @UseGuards(AuthGuard('google'))
  @Get('google')
  async googleAuth() {}

  @UseGuards(AuthGuard('google/redirect'))
  @Get('google')
  async googleAuthRedirect(@Req() req: Request) {
    return await this.authService.googleLogin(req.user);
  }
}
