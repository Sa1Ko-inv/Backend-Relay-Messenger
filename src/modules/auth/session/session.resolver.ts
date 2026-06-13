import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { UserModel } from '@/src/modules/auth/account/models/user.model';
import { LoginInput } from '@/src/modules/auth/session/inputs/login.input';
import type { GqlContext } from '@/src/shared/types/gql-contex.type';

import { SessionService } from './session.service';

@Resolver('Session')
export class SessionResolver {
   public constructor(private readonly sessionService: SessionService) {}

   @Mutation(() => UserModel, { name: 'loginUser' })
   public async login(@Context() { req }: GqlContext, @Args('data') input: LoginInput) {
      return this.sessionService.login(req, input);
   }

   @Mutation(() => Boolean, { name: 'logoutUser' })
   public async logout(@Context() { req }: GqlContext) {
      return this.sessionService.logout(req);
   }
}
