import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

@InputType()
export class ChangeConversationUsernameInput {
    @Field(() => String)
    @MaxLength(50)
    @MinLength(5)
    @IsString()
    @Matches(/^[a-zA-Z0-9_]+$/, {
      message: 'Username может содержать только латинские буквы, цифры и нижнее подчеркивание',
   })
   public username: string;

    @Field(() => String)
    @IsUUID()
    public conversationId: string;
}