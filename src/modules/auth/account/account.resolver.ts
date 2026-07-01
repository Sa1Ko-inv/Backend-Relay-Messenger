import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { User } from '@prisma/client';

import { ChangeEmailInput } from '@/src/modules/auth/account/change-email/inputs/change-email.input';
import { ChangePasswordInput } from '@/src/modules/auth/account/inputs/change-password.input';
import { CreateUserInput } from '@/src/modules/auth/account/inputs/create-user.input';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';

import { AccountService } from './account.service';
import { UserModel } from './models/user.model';

@Resolver('Account')
export class AccountResolver {
   public constructor(private readonly accountService: AccountService) {}

   @Authorization()
   @Query(() => UserModel, { name: 'findProfile' })
   public async me(@Authorized('id') id: string) {
      return this.accountService.me(id);
   }

   @Mutation(() => Boolean, { name: 'createUser' })
   public async createUser(@Args('data') input: CreateUserInput) {
      return this.accountService.createUser(input);
   }

   @Authorization()
   @Mutation(() => Boolean, { name: 'changeEmail' })
   public async changeEmail(@Authorized() user: User, @Args('data') input: ChangeEmailInput) {
      return this.accountService.changeEmail(user, input);
   }

   @Authorization()
   @Mutation(() => Boolean, { name: 'changePassword' })
   public async changePassword(@Authorized() user: User, @Args('data') input: ChangePasswordInput) {
      return this.accountService.changePassword(user, input);
   }
}
