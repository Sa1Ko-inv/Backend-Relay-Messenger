import {
   Injectable,
   InternalServerErrorException,
   UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { User } from '@prisma/client';
import type { Request } from 'express';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { RedisService } from '@/src/core/redis/redis.service';
import type { SessionMetadata } from '@/src/shared/types/session-metadata.types';

@Injectable()
export class AuthSessionService {
   public constructor(
      private readonly prismaService: PrismaService,
      private readonly configService: ConfigService,
      private readonly redisService: RedisService
   ) {}

   public saveSession(req: Request, user: User, metadata: SessionMetadata) {
      return new Promise((resolve, reject) => {
         req.session.createdAt = new Date();
         req.session.userId = user.id;
         req.session.metadata = metadata;

         req.session.save(err => {
            if (err) {
               return reject(new InternalServerErrorException('Не удалось сохранить сессию'));
            }
            resolve({ user, accessToken: req.session.id });
         });
      });
   }

   public async destroySession(req: Request) {
      // Если запрос пришёл через Bearer-токен — удаляем сессию из Redis
      const bearerSessionId = req._bearerSessionId;

      if (bearerSessionId) {
         const prefix = this.configService.getOrThrow<string>('SESSION_FOLDER');
         await this.redisService.client.del(`${prefix}${bearerSessionId}`);
         return true;
      }

      // Иначе — стандартное уничтожение cookie-сессии
      return new Promise((resolve, reject) => {
         req.session.destroy(err => {
            if (err) {
               return reject(new InternalServerErrorException('Не удалось завершить сессию'));
            }

            req.res?.clearCookie(this.configService.getOrThrow('SESSION_NAME'));
            resolve(true);
         });
      });
   }

   public async getAllUserSessions(userId: string, currentSessionId: string) {
      const keys = await this.redisService.client.keys('*');

      const userSession: any[] = [];

      for (const key of keys) {
         const sessionData = await this.redisService.client.get(key);

         if (sessionData) {
            const session = JSON.parse(sessionData);

            if (session.userId === userId) {
               userSession.push({
                  ...session,
                  id: key.split(':')[1],
               });
            }
         }
      }

      userSession.sort(
         (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return userSession.filter(session => session.id !== currentSessionId);
   }

   public async findCurrentSession(sessionId: string) {
      const sessionData = await this.redisService.client.get(
         `${this.configService.get<string>('SESSION_FOLDER')}${sessionId}`
      );

      if (!sessionData) {
         throw new Error('Сессия не найдена');
      }

      const session = JSON.parse(sessionData);

      return { ...session, id: sessionId };
   }

   public async resolveSessionFromRequest(request: Request) {
      // 1. Попытка через cookie-сессию (веб / Next.js)
      if (request.session?.userId) {
         const user = await this.prismaService.user.findUnique({
            where: { id: request.session.userId },
         });

         if (!user) {
            throw new UnauthorizedException('Пользователь не найден');
         }

         request.user = user;
         return true;
      }

      // 2. Попытка через Bearer-токен (мобильные клиенты)
      const authHeader = request.headers.authorization as string;

      if (authHeader?.startsWith('Bearer ')) {
         const token = authHeader.split(' ')[1];
         const prefix = this.configService.getOrThrow<string>('SESSION_FOLDER');
         const sessionDataStr = await this.redisService.client.get(`${prefix}${token}`);

         if (!sessionDataStr) {
            throw new UnauthorizedException('Сессия недействительна или истекла');
         }

         const sessionData = JSON.parse(sessionDataStr);

         const user = await this.prismaService.user.findUnique({
            where: { id: sessionData.userId },
         });

         if (!user) {
            throw new UnauthorizedException('Пользователь не найден');
         }

         request.user = user;
         // Сохраняем ID Bearer-сессии отдельно (session.id нельзя переопределить)
         // НЕ трогаем request.session, чтобы express-session не создавал лишнюю сессию в Redis
         request._bearerSessionId = token;
         return true;
      }
      throw new UnauthorizedException('Пользователь не авторизован');
   }

   public async removeSession(sessionId: string) {
      await this.redisService.client.del(
         `${this.configService.get<string>('SESSION_FOLDER')}${sessionId}`
      );
      return true;
   }
}
