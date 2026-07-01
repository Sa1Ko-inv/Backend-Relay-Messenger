import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { MailService } from '@/src/modules/libs/mail/mail.service';

@Injectable()
export class CronService {
   public constructor(
      private readonly prismaService: PrismaService,
      private readonly mailService: MailService
   ) {}

   @Cron('0 0 * * *')
   public async deleteDeactivateAccounts() {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDay() - 7);

      const deactivatedAccounts = await this.prismaService.user.findMany({
         where: {
            isDeactivated: true,
            deactivatedAt: {
               lte: sevenDaysAgo,
            },
         },
      });

      for (const user of deactivatedAccounts) {
         await this.mailService.sendAccountDeletion(user.email);
      }

      console.log('Уделенные деактивированные аккаунты', deactivatedAccounts);

      await this.prismaService.user.deleteMany({
         where: {
            isDeactivated: true,
            deactivatedAt: {
               lte: sevenDaysAgo,
            },
         },
      });
   }
}
