import { Field, InputType } from '@nestjs/graphql';
import type { ConversationVisibility } from '@prisma/client';
import { IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

@InputType()
export class WorkAvatarInput {
   @Field(() => String)
   @IsUUID()
   public conversationId: string;
}
