import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './database/database.service';
import { Prisma, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  private async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({ data });
  }

  private async findUser(value: string, key: string): Promise<User> {
    const where = {} as Prisma.UserWhereUniqueInput;
    where[key] = value;
    return await this.prisma.user.findUnique({ where });
  }

  async signUp({ email, password }): Promise<string> {
    const userExist = await this.findUser(email, 'email');
    if (userExist) {
      throw new BadRequestException({ message: 'User already exist' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 4);
      const user = await this.createUser({
        email,
        password: hashedPassword,
        refreshToken: '',
      });
      const refreshToken = await this.refreshToken(user.id);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });
      return await this.jwt.signAsync({ id: user.id });
    }
  }

  async singIn(email: string, password: string): Promise<string> {
    const user = await this.findUser(email, 'email');
    const validPass = await bcrypt.compare(password, user.password);
    if (user && validPass) {
      const token = this.jwt.sign({ id: user.id });
      return token;
    } else {
      throw new NotFoundException({ message: 'User not foud', status: 404 });
    }
  }

  async verifyToken(token: string): Promise<User> {
    const data: { id: string } = await this.jwt.verifyAsync(token);
    const user = await this.findUser(data.id, 'id');
    return user;
  }

  private async refreshToken(id: string): Promise<string> {
    return await this.jwt.signAsync(
      { id: id },
      { expiresIn: '7d', secret: process.env.REFRESH_SERET },
    );
  }
}
