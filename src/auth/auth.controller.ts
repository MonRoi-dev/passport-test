import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async getLogIn(@Req() req: Request, @Res() res: Response): Promise<Response> {
    for (const token in req.user) {
      res.cookie(token, req.user[token], {
        maxAge: 1000000000,
        httpOnly: true,
        signed: true,
      });
    }
    return res.status(200).send('Successfully logged in');
  }

  @Post('register')
  async singUp(
    @Res() res: Response,
    @Body() data: Prisma.UserCreateInput,
  ): Promise<Response> {
    await this.authService.register(data.username, data.password);
    return res.status(200).send('Successfully registred');
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('logout')
  async logOut(@Req() req: Request, @Res() res: Response): Promise<Response> {
    await this.authService.logout(req.user['id']);
    res.clearCookie('token');
    return res.status(200).send('Successfully logged out');
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Get('refresh')
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    const id = req.user['id'];
    const refreshToken = req.user['refreshToken'];
    await this.authService.refreshTokens(id, refreshToken);
    return res.status(200).send('Tokens refreshed!');
  }
}
