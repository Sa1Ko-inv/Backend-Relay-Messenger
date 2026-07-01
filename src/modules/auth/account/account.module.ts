import { Module } from '@nestjs/common';

import { VerificationService } from '@/src/modules/auth/verification/verification.service';

import { AccountResolver } from './account.resolver';
import { AccountService } from './account.service';
import { ChangeEmailModule } from './change-email/change-email.module';

@Module({
   providers: [AccountResolver, AccountService, VerificationService],
   imports: [ChangeEmailModule],
})
export class AccountModule {}
