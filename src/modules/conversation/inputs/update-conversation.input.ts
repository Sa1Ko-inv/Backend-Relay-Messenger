import { Field, InputType } from '@nestjs/graphql';
import type { ConversationVisibility } from '@prisma/client';
import { IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

@InputType()
export class UpdateConversationInput {
   @Field(() => String, { nullable: true })
   @IsString()
   @IsOptional()
   @MinLength(3)
   @MaxLength(50)
   public title?: string;

   @Field(() => String, { nullable: true })
   @IsOptional()
   @IsString()
   @MaxLength(200)
   public description?: string;

   @Field(() => String)
   @IsUUID()
   public conversationId: string;
}
