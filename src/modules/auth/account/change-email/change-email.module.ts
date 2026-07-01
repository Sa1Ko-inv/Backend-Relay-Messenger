import { Module } from '@nestjs/common';
import { ChangeEmailService } from './change-email.service';
import { ChangeEmailResolver } from './change-email.resolver';

@Module({
  providers: [ChangeEmailResolver, ChangeEmailService],
})
export class ChangeEmailModule {}
