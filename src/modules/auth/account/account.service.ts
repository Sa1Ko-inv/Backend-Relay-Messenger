import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { CreateUserInput } from '@/src/modules/auth/account/inputs/create-user.input';

@Injectable()
export class AccountService {
   public constructor(private readonly prismaService: PrismaService) {}

   public async findAll() {
      const user = await this.prismaService.user.findMany();

      return user;
   }

   public async createUser(input: CreateUserInput) {
      const { username, password, email } = input;
   }
}
