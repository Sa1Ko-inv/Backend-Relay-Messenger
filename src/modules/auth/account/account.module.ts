import { Module } from '@nestjs/common';

import { VerificationService } from '@/src/modules/auth/verification/verification.service';

import { AccountResolver } from './account.resolver';
import { AccountService } from './account.service';

@Module({
   providers: [AccountResolver, AccountService, VerificationService],
})
export class AccountModule {}
