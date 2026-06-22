import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { UserModel } from '@/src/modules/auth/account/models/user.model';
import { VerificationInput } from '@/src/modules/auth/verification/inputs/verification.input';
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator';
import type { GqlContext } from '@/src/shared/types/gql-context.types';

import { VerificationService } from './verification.service';

@Resolver('Verification')
export class VerificationResolver {
   public constructor(private readonly verificationService: VerificationService) {}

   @Mutation(() => UserModel, { name: 'verifyAccount' })
   public async verify(
      @Context() { req }: GqlContext,
      @Args('data') input: VerificationInput,
      @UserAgent() userAgent: string
   ) {
      return this.verificationService.verify(req, input, userAgent);
   }
}
