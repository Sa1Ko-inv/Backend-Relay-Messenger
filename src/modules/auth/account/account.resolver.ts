import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateUserInput } from '@/src/modules/auth/account/inputs/create-user.input';

import { AccountService } from './account.service';
import { UserModel } from './models/user.model';

@Resolver('Account')
export class AccountResolver {
   public constructor(private readonly accountService: AccountService) {}

   @Query(() => [UserModel], { name: 'findAllUsers' })
   public async findAll() {
      return this.accountService.findAll();
   }

   @Mutation(() => Boolean, { name: 'createUser' })
   public async createUser(@Args('data') input: CreateUserInput) {
      return this.accountService.createUser(input);
   }
}
