import { ConflictException, Injectable } from '@nestjs/common';
import {
   ConversationRole,
   ConversationType,
   ConversationVisibility,
   User,
} from '@prisma/client';
import { hash, verify } from 'argon2';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { ChangeEmailInput } from '@/src/modules/auth/account/change-email/inputs/change-email.input';
import { ChangePasswordInput } from '@/src/modules/auth/account/inputs/change-password.input';
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

      const user = await this.prismaService.$transaction(async tx => {
         const newUser = await tx.user.create({
            data: {
               username,
               email,
               password: await hash(password),
               displayName: username,
            },
         });

         await tx.conversation.create({
            data: {
               type: ConversationType.FAVORITES,
               visibility: ConversationVisibility.PRIVATE,
               ownerId: newUser.id,
               settings: { create: {} },
               members: {
                  create: {
                     userId: newUser.id,
                     role: ConversationRole.OWNER,
                  },
               },
            },
         });

         return newUser;
      });

      await this.verificationService.sendVerificationToken(user);

      return true;
   }

   public async changeEmail(user: User, input: ChangeEmailInput) {
      const { email } = input;

      await this.prismaService.user.update({
         where: {
            id: user.id,
         },
         data: {
            email,
         },
      });

      return true;
   }

   public async changePassword(user: User, input: ChangePasswordInput) {
      const { oldPassword, newPassword } = input;

      const isValidPassword = await verify(user.password, oldPassword);

      if (!isValidPassword) {
         throw new ConflictException('Неверный старый пароль');
      }

      await this.prismaService.user.update({
         where: {
            id: user.id,
         },
         data: {
            password: await hash(newPassword),
         },
      });

      return true;
   }
}
