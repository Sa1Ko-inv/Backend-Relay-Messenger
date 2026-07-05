import {
   BadRequestException,
   ConflictException,
   Injectable,
   InternalServerErrorException,
   NotFoundException,
   UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';
import type { Request } from 'express';
import { TOTP } from 'otpauth';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { AuthSessionService } from '@/src/modules/auth/auth-session.service';
import { LoginInput } from '@/src/modules/auth/session/inputs/login.input';
import { VerificationService } from '@/src/modules/auth/verification/verification.service';
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.utils';

@Injectable()
export class SessionService {
   public constructor(
      private readonly prismaService: PrismaService,
      private readonly configService: ConfigService,
      private readonly verificationService: VerificationService,
      private readonly authSessionService: AuthSessionService
   ) {}

   // Метод для получения всех сессий текущего пользователя, кроме текущей
   public async findByUser(req: Request) {
      const userId = req.user?.id || req.session.userId;

      if (!userId) {
         throw new NotFoundException('Пользователь не обнаружен в сессии');
      }

      const currentSessionId = req._bearerSessionId || req.session.id;

      return this.authSessionService.getAllUserSessions(userId, currentSessionId);
   }

   //  Метод для получение текущей сессии
   public async findCurrent(req: Request) {
      const sessionId = req._bearerSessionId || req.session.id;

      return this.authSessionService.findCurrentSession(sessionId);
   }

   public async login(req: Request, input: LoginInput, userAgent: string) {
      const { login, password, pin } = input;

      const user = await this.prismaService.user.findFirst({
         where: {
            OR: [{ username: { equals: login } }, { email: { equals: login } }],
         },
      });

      if (!user) {
         throw new NotFoundException('Пользователь не найден');
      }

      const isValidPassword = await verify(user.password, password);

      if (!isValidPassword) {
         throw new UnauthorizedException('Неверный пароль');
      }

      if (!user.isEmailVerified) {
         await this.verificationService.sendVerificationToken(user);

         throw new BadRequestException(
            'Аккаунт не верифицирован. Пожалуйста, проверьте свою почту для подтверждение'
         );
      }

      if (user.IsTotpEnabled) {
         if (!pin) {
            return {
               user: null,
               message: 'Необходим код для завершения авторизации',
            };
         }
         const totp = new TOTP({
            issuer: 'Relay Messenger',
            label: `${user.email}`,
            algorithm: 'SHA1',
            digits: 6,
            secret: user.totpSecret!,
         });

         const delta = totp.validate({ token: pin });

         if (delta === null) {
            throw new BadRequestException('Неверный код');
         }
      }

      const metadata = getSessionMetadata(req, userAgent);

      return this.authSessionService.saveSession(req, user, metadata);
   }

   public async logout(req: Request) {
      return this.authSessionService.destroySession(req);
   }

   // Метод для очистки куки
   public async clearSession(req: Request) {
      req.res?.clearCookie(this.configService.getOrThrow('SESSION_NAME'));
      return true;
   }

   // Метод для удаления сессии
   public async remove(req: Request, id: string) {
      const currentSessionId = req._bearerSessionId || req.session.id;

      if (currentSessionId === id) {
         throw new ConflictException('Невозможно удалить текущую сессию');
      }

      await this.authSessionService.removeSession(id);

      return true;
   }
}
