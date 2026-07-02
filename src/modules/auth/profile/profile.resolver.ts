import { Args, Mutation, Resolver } from '@nestjs/graphql';
import type { User } from '@prisma/client';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import Upload from 'graphql-upload/Upload.mjs';

import { ChangeProfileInfoInput } from '@/src/modules/auth/profile/inputs/change-profile-info.input';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { FileValidationPipe } from '@/src/shared/pipes/file-validation.pipe';

import { ProfileService } from './profile.service';

@Resolver('Profile')
export class ProfileResolver {
   public constructor(private readonly profileService: ProfileService) {}

   @Authorization()
   @Mutation(() => Boolean, { name: 'changeProfileAvatar' })
   public async changeAvatar(
      @Authorized() user: User,
      @Args('avatar', { type: () => GraphQLUpload }, FileValidationPipe) avatar: Upload
   ) {
      return this.profileService.changeAvatar(user, avatar);
   }

   @Authorization()
   @Mutation(() => Boolean, { name: 'removeProfileAvatar' })
   public async removeAvatar(@Authorized() user: User) {
      return this.profileService.removeAvatar(user);
   }

   @Authorization()
   @Mutation(() => Boolean, { name: 'changeProfileInfo' })
   public async changeInfo(
      @Authorized() user: User,
      @Args('data') input: ChangeProfileInfoInput
   ) {
      return this.profileService.changeInfo(user, input);
   }
}
