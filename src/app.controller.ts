import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { Req } from '@nestjs/common';
import { Res } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appSerivse: AppService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/user')
  async createUser(
    @Req() req: Request,
    @Res() res: Response,
    @Body() data: Prisma.UserCreateInput,
  ): Promise<Response> {
    const user = await this.appSerivse.createUser(data);
    return res.status(200).send(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/user')
  async getUser(@Req() req: Request, @Res() res: Response): Promise<Response> {
    const token = req.cookies.token;
    const user = await this.appSerivse.verifyToken(token);
    return res.status(200).send(user);
  }

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(@Req() req: Request, @Res() res: Response) {
    res.cookie('token', req.user, { httpOnly: true, maxAge: 60000 });
    return res.status(200).send(req.user);
  }
}
