import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '@prisma/client';

import { EnableTotpInput } from '@/src/modules/auth/totp/inputs/enable-totp.input';
import { TotpModel } from '@/src/modules/auth/totp/models/totp.model';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';

import { TotpService } from './totp.service';

@Resolver('Totp')
export class TotpResolver {
   constructor(private readonly totpService: TotpService) {}

   @Authorization()
   @Query(() => TotpModel, { name: 'generateTotpSecret' })
   public async generate(@Authorized() user: User) {
      return this.totpService.generateTotpSecret(user);
   }

   @Authorization()
   @Mutation(() => Boolean, { name: 'enableTotp' })
   public async enable(@Authorized() user: User, @Args('data') input: EnableTotpInput) {
      return this.totpService.enableTotp(user, input);
   }

   @Authorization()
   @Mutation(() => Boolean, { name: 'disableTotp' })
   public async disable(@Authorized() user: User) {
      return this.totpService.disableTotp(user);
   }
}
