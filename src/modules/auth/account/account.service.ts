import { ConflictException, Injectable } from '@nestjs/common';
import { hash } from 'argon2';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { CreateUserInput } from '@/src/modules/auth/account/inputs/create-user.input';
import { VerificationService } from '@/src/modules/auth/verification/verification.service';

@Injectable()
export class AccountService {
   public constructor(
      private readonly prismaService: PrismaService,
      private readonly verificationService: VerificationService
   ) {}

   public async me(id: string) {
      const user = await this.prismaService.user.findUnique({
         where: { id },
      });

      return user;
   }

   public async createUser(input: CreateUserInput) {
      const { username, password, email } = input;

      const isUserExists = await this.prismaService.user.findUnique({
         where: { username },
      });

      if (isUserExists) {
         throw new ConflictException('Это имя пользователя занято');
      }

      const isEmailExist = await this.prismaService.user.findUnique({
         where: { email },
      });

      if (isEmailExist) {
         throw new ConflictException('Эта почта уже занят');
      }

      const user = await this.prismaService.user.create({
         data: { username, email, password: await hash(password), displayName: username },
      });

      await this.verificationService.sendVerificationToken(user);

      return true;
   }
}
