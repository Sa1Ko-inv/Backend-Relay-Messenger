import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { encode } from 'hi-base32';
import { randomBytes } from 'node:crypto';

import { PrismaService } from '@/src/core/prisma/prisma.service';

@Injectable()
export class TotpService {
   public constructor(private readonly prismaService: PrismaService) {}

   public async generateTotpSecret(user: User) {
      const secret = encode(randomBytes(15)).replace(/=/g, '');
   }
}
