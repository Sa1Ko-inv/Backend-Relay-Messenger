import {
   BadRequestException,
   ConflictException,
   Injectable,
   NotFoundException,
   UnauthorizedException,
} from '@nestjs/common';
import { TokenType, type User } from '@prisma/client';
import type { Request } from 'express';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { ConfirmNewEmailInput } from '@/src/modules/auth/account/change-email/inputs/confirm-new-email.input';
import { NewEmailInput } from '@/src/modules/auth/account/change-email/inputs/new-email.input';
import { MailService } from '@/src/modules/libs/mail/mail.service';
import { generateToken } from '@/src/shared/utils/generate-token.util';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.utils';

@Injectable()
export class ChangeEmailService {
   public constructor(
      private readonly prismaService: PrismaService,
      private readonly mailService: MailService
   ) {}

   public async changeEmail(req: Request, user: User, userAgent: string) {
      if (!user.isEmailVerified) {
         throw new BadRequestException('Сначала подтвердите текущую почту');
      }

      const changeToken = await generateToken(this.prismaService, user, TokenType.CHANGE_EMAIL);

      const metadata = getSessionMetadata(req, userAgent);

      await this.mailService.sendChangeEmailToken(user.email, changeToken.token, metadata);

      return true;
   }

   public async newEmail(req: Request, input: NewEmailInput, userAgent: string) {
      const { email, token } = input;

      const existingToken = await this.prismaService.token.findUnique({
         where: { token, type: TokenType.CHANGE_EMAIL },
      });

      if (!existingToken) {
         throw new UnauthorizedException('Токен не найден');
      }

      const hasExpired = new Date(existingToken.expiresIn) < new Date();

      if (hasExpired) {
         throw new BadRequestException('Токен истек');
      }

      const isEmailExist = await this.prismaService.user.findUnique({
         where: { email },
      });

      if (isEmailExist) {
         throw new ConflictException('Эта почта уже занята');
      }

      await this.prismaService.token.update({
         where: { id: existingToken.id },
         data: { newEmail: email },
      });

      const confirmToken = await generateToken(
         this.prismaService,
         { id: existingToken.userId } as User,
         TokenType.EMAIL_VERIFICATION
      );

      await this.mailService.sendVerificationToken(email, confirmToken.token);

      return true;
   }

   public async confirmNewEmail(input: ConfirmNewEmailInput) {
      const { token } = input;

      const existingToken = await this.prismaService.token.findUnique({
         where: { token, type: TokenType.EMAIL_VERIFICATION },
      });

      if (!existingToken) {
         throw new UnauthorizedException('Токен не найден');
      }

      const hasExpired = new Date(existingToken.expiresIn) < new Date();

      if (hasExpired) {
         throw new BadRequestException('Токен истек');
      }

      // Находим токен смены email с сохраненной новой почтой
      const changeEmailToken = await this.prismaService.token.findFirst({
         where: {
            userId: existingToken.userId,
            type: TokenType.CHANGE_EMAIL,
            newEmail: { not: null },
         },
      });

      if (!changeEmailToken || !changeEmailToken.newEmail) {
         throw new BadRequestException('Не найден запрос на смену почты');
      }

      // Меняем email в БД
      await this.prismaService.user.update({
         where: { id: existingToken.userId! },
         data: {
            email: changeEmailToken.newEmail,
            isEmailVerified: true, // Сразу подтверждаем новую почту
         },
      });

      // Удаляем оба токена
      await this.prismaService.token.deleteMany({
         where: {
            userId: existingToken.userId,
            type: { in: [TokenType.CHANGE_EMAIL, TokenType.EMAIL_VERIFICATION] },
         },
      });

      return true;
   }
}
