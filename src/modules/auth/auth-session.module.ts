import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { AuthSessionService } from '@/src/modules/auth/auth-session.service';

@Global()
@Module({
   providers: [AuthSessionService, ConfigService, PrismaService],
   exports: [AuthSessionService],
})
export class AuthSessionModule {}
