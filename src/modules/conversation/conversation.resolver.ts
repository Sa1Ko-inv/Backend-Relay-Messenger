import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { CreatePersonalConversationInput } from '@/src/modules/conversation/inputs/create-personal-conversation.input';
import { Authorization } from '@/src/shared/decorators/auth.decorator';
import { Authorized } from '@/src/shared/decorators/authorized.decorator';

import { ConversationService } from './conversation.service';

@Resolver('Conversation')
export class ConversationResolver {
   constructor(private readonly conversationService: ConversationService) {}

   @Authorization()
   @Mutation(() => Boolean, { name: 'createPersonalConversation' })
   public async createPersonalConversation(
      @Authorized('id') id: string,
      @Args('data') input: CreatePersonalConversationInput
   ) {
      return this.conversationService.createPersonalConversation(id, input);
   }
}
