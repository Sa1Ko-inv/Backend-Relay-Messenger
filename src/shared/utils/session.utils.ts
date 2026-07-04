import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { User } from '@prisma/client';
import type { Request } from 'express';

import type { RedisService } from '@/src/core/redis/redis.service';
import type { SessionMetadata } from '@/src/shared/types/session-metadata.types';

export function saveSession(req: Request, user: User, metadata: SessionMetadata) {
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

export async function destroySession(
   req: Request,
   configService: ConfigService,
   redisService?: RedisService
) {
   // Если запрос пришёл через Bearer-токен — удаляем сессию из Redis
   const bearerSessionId = req._bearerSessionId;

   if (bearerSessionId && redisService) {
      const prefix = configService.getOrThrow<string>('SESSION_FOLDER');
      await redisService.client.del(`${prefix}${bearerSessionId}`);
      return true;
   }

   // Иначе — стандартное уничтожение cookie-сессии
   return new Promise((resolve, reject) => {
      req.session.destroy(err => {
         if (err) {
            return reject(new InternalServerErrorException('Не удалось завершить сессию'));
         }

         req.res?.clearCookie(configService.getOrThrow('SESSION_NAME'));
         resolve(true);
      });
   });
}
