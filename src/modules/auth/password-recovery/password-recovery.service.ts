import {
   BadRequestException,
   Injectable,
   NotFoundException,
   UnauthorizedException,
} from '@nestjs/common';
import { TokenType } from '@prisma/client';
import { hash } from 'argon2';
import type { Request } from 'express';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { NewPasswordInput } from '@/src/modules/auth/password-recovery/inputs/new-password.input';
import { ResetPasswordInput } from '@/src/modules/auth/password-recovery/inputs/reset-password.input';
import { MailService } from '@/src/modules/libs/mail/mail.service';
import { generateToken } from '@/src/shared/utils/generate-token.util';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.utils';

@Injectable()
export class PasswordRecoveryService {
   public constructor(
      private readonly prismaService: PrismaService,
      private readonly mailService: MailService
   ) {}

   public async resetPassword(req: Request, input: ResetPasswordInput, userAgent: string) {
      const { email } = input;

      const user = await this.prismaService.user.findFirst({
         where: { email },
      });

      if (!user) {
         throw new NotFoundException('Пользователь не найден');
      }

      const resetToken = await generateToken(this.prismaService, user, TokenType.PASSWORD_RESET);

      const metadata = getSessionMetadata(req, userAgent);

      await this.mailService.sendPasswordResetToken(user.email, resetToken.token, metadata);

      return true;
   }

   public async newPassword(input: NewPasswordInput) {
      const { password, token } = input;

      const existingToken = await this.prismaService.token.findUnique({
         where: { token, type: TokenType.PASSWORD_RESET },
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
         data: { password: await hash(password) },
      });

      await this.prismaService.token.delete({
         where: { id: existingToken.id, type: TokenType.PASSWORD_RESET },
      });

      return true;
   }
}
