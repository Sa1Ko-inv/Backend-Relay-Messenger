import { Module } from '@nestjs/common';

import { PrismaModule } from '@/src/core/prisma/prisma.module';
import { MailModule } from '@/src/modules/libs/mail/mail.module';


import { ChangeEmailResolver } from './change-email.resolver';
import { ChangeEmailService } from './change-email.service';

@Module({
   imports: [PrismaModule, MailModule],
   providers: [ChangeEmailResolver, ChangeEmailService],
})
export class ChangeEmailModule {}
