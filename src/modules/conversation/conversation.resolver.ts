import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '@prisma/client';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import Upload from 'graphql-upload/Upload.mjs';

import { CreateGroupInput } from '@/src/modules/conversation/inputs/create-group.input';
import { CreatePersonalConversationInput } from '@/src/modules/conversation/inputs/create-personal-conversation.input';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';
import { FileValidationPipe } from '@/src/shared/pipes/file-validation.pipe';

import { ConversationService } from './conversation.service';
import { ConversationModel } from './models/conversation.model';
import { MakeGroupPublicInput } from './inputs/make-group-public.input';

@Resolver('Conversation')
export class ConversationResolver {
   constructor(private readonly conversationService: ConversationService) {}

   @Authorization()
   @Mutation(() => ConversationModel, { name: 'createPersonalConversation' })
   public async createPersonalConversation(
      @Authorized('id') id: string,
      @Args('data') input: CreatePersonalConversationInput
   ) {
      return this.conversationService.createPersonalConversation(id, input);
   }

   @Authorization()
   @Query(() => ConversationModel, { name: 'getFavoritesConversation' })
   public async getFavoritesConversation(@Authorized('id') id: string) {
      return this.conversationService.getFavoritesConversation(id);
   }

   @Authorization()
   @Mutation(() => ConversationModel, { name: 'createGroupConversation' })
   public async createGroupConversation(
      @Authorized() user: User,
      @Args('data') input: CreateGroupInput,
      @Args('avatar', { type: () => GraphQLUpload, nullable: true }, FileValidationPipe)
      avatar: Upload
   ) {
      return this.conversationService.createGroupConversation(input, user, avatar);
   }

   @Authorization()
   @Mutation(() => ConversationModel, { name: 'makeGroupPublic' })
   public async makeGroupPublic(
      @Authorized() user: User,
      @Args('data') input: MakeGroupPublicInput
   ) {
      return this.conversationService.makeGroupPublic(user, input);
   }
}
