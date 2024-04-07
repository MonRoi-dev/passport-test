import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './database/database.service';
import { Prisma, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({ data });
  }

  async findUser(id: string): Promise<User> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async validateUser(email: string, password: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.password === password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const token = this.jwt.sign({ id: user.id });
      return token;
    } else {
      throw new NotFoundException({ message: 'User not foud', status: 404 });
    }
  }

  async verifyToken(token: string): Promise<User> {
    const data: { id: string } = await this.jwt.verifyAsync(token);
    const user = await this.findUser(data.id);
    return user;
  }
}
