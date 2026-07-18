import { Field, InputType } from '@nestjs/graphql';
import type { ConversationVisibility } from '@prisma/client';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateGroupInput {
   @Field(() => String)
   @IsString()
   @MinLength(3)
   @MaxLength(50)
   public title: string;

   @Field(() => String)
   @IsOptional()
   @IsString()
   @MaxLength(200)
   public description: string;
}
