import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

@InputType()
export class MakeGroupPublicInput {
   @Field(() => String, { nullable: true })
   @MaxLength(50)
   @MinLength(5)
   @IsString()
   @IsOptional()
   @Matches(/^[a-zA-Z0-9_]+$/, {
      message: 'Username может содержать только латинские буквы, цифры и нижнее подчеркивание',
   })
   public username?: string;

   @Field(() => String)
   @IsUUID()
   public conversationId: string;
}
