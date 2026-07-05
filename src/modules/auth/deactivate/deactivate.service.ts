import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenType, type User } from '@prisma/client';
import { verify } from 'argon2';
import type { Request } from 'express';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { AuthSessionService } from '@/src/modules/auth/auth-session.service';
import { DeactivateAccountInput } from '@/src/modules/auth/deactivate/inputs/deactivate-account.input';
import { MailService } from '@/src/modules/libs/mail/mail.service';
import { generateToken } from '@/src/shared/utils/generate-token.util';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.utils';

@Injectable()
export class DeactivateService {
   public constructor(
      private readonly prismaService: PrismaService,
      private readonly configService: ConfigService,
      private readonly mailService: MailService,
      private readonly authSessionService: AuthSessionService
   ) {}

   public async deactivate(
      req: Request,
      input: DeactivateAccountInput,
      user: User,
      userAgent: string
   ) {
      const { email, password, pin } = input;

      if (user.email !== email) {
         throw new BadRequestException('Неверная электронная почта');
      }

      const isValidPassword = await verify(user.password, password);

      if (!isValidPassword) {
         throw new BadRequestException('Неверный пароль');
      }

      if (!pin) {
         await this.sendDeactivateToken(req, user, userAgent);

         return { message: 'Требуется код подтверждения' };
      }

      await this.validateDeactivateToken(req, pin);

      return { user };
   }

   private async validateDeactivateToken(req: Request, token: string) {
      const existingToken = await this.prismaService.token.findUnique({
         where: { token, type: TokenType.DEACTIVATE_ACCOUNT },
      });

      if (!existingToken) {
         throw new UnauthorizedException('Токен не найден');
      }

      const hasExpired = new Date(existingToken.expiresIn) < new Date();

      if (hasExpired) {
         throw new BadRequestException('Токен истек');
      }

      await this.prismaService.user.update({
         where: { id: existingToken.userId! },
         data: { isDeactivated: true, deactivatedAt: new Date() },
      });

      await this.prismaService.token.delete({
         where: { id: existingToken.id, type: TokenType.DEACTIVATE_ACCOUNT },
      });

      return this.authSessionService.destroySession(req);
   }

   public async sendDeactivateToken(req: Request, user: User, userAgent: string) {
      const deactivateToken = await generateToken(
         this.prismaService,
         user,
         TokenType.DEACTIVATE_ACCOUNT,
         false
      );

      const metadata = getSessionMetadata(req, userAgent);

      await this.mailService.sendDeactivateToken(user.email, deactivateToken.token, metadata);

      return true;
   }
}
