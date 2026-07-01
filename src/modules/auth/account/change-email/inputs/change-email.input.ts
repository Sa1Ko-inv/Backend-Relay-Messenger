import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

@InputType()
export class ChangeEmailInput {
   @Field()
   @IsString({ message: 'Почта должна быть строкой' })
   @IsNotEmpty({ message: 'Почта не может быть пустым' })
   @IsEmail({}, { message: 'Некорректный формат почты' })
   public email: string;
}
