import { Field, InputType } from '@nestjs/graphql';
import { ConversationVisibility } from '@prisma/client';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateChannelInput {
   @Field(() => String)
   @IsString()
   @MinLength(3)
   @MaxLength(50)
   public title: string;

   @Field(() => String, { nullable: true })
   @IsOptional()
   @IsString()
   @MaxLength(200)
   public description: string;

   @Field(() => String, { nullable: true })
   @MaxLength(50)
   @MinLength(5)
   @IsString()
   @IsOptional()
   @Matches(/^[a-zA-Z0-9_]+$/, {
      message: 'Username может содержать только латинские буквы, цифры и нижнее подчеркивание',
   })
   public username?: string;

   @Field(() => ConversationVisibility)
   public visibility: ConversationVisibility;
}
