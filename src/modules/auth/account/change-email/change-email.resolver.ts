import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import type { User } from '@prisma/client';

import { ConfirmNewEmailInput } from '@/src/modules/auth/account/change-email/inputs/confirm-new-email.input';
import { NewEmailInput } from '@/src/modules/auth/account/change-email/inputs/new-email.input';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator';
import type { GqlContext } from '@/src/shared/types/gql-context.types';

import { ChangeEmailService } from './change-email.service';

@Resolver('ChangeEmail')
export class ChangeEmailResolver {
   constructor(private readonly changeEmailService: ChangeEmailService) {}

   @Authorization()
   @Mutation(() => Boolean, { name: 'changeEmail' })
   public async changeEmail(
      @Context() { req }: GqlContext,
      @Authorized() user: User,
      @UserAgent() userAgent: string
   ) {
      return this.changeEmailService.changeEmail(req, user, userAgent);
   }

   @Authorization()
   @Mutation(() => Boolean, { name: 'newEmail' })
   public async NewEmail(
      @Context() { req }: GqlContext,
      @Args('data') input: NewEmailInput,
      @UserAgent() userAgent: string
   ) {
      return this.changeEmailService.newEmail(req, input, userAgent);
   }

   @Mutation(() => Boolean, { name: 'confirmNewEmail' })
   public async confirmNewEmail(@Args('data') input: ConfirmNewEmailInput) {
      return this.changeEmailService.confirmNewEmail(input);
   }
}
