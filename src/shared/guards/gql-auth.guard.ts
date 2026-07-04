import {
   type CanActivate,
   type ExecutionContext,
   Injectable,
   UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { RedisService } from '@/src/core/redis/redis.service';

@Injectable()
export class GqlAuthGuard implements CanActivate {
   public constructor(
      private readonly prismaService: PrismaService,
      private readonly redisService: RedisService,
      private readonly configService: ConfigService
   ) {}

   public async canActivate(context: ExecutionContext): Promise<boolean> {
      const ctx = GqlExecutionContext.create(context);
      const request = ctx.getContext().req;

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
}
