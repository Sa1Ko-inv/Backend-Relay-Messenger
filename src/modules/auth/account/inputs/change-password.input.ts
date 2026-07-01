import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

@InputType()
export class ChangePasswordInput {
   @Field()
   @IsString()
   @IsNotEmpty({ message: 'Пароль не может быть пустым' })
   @MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
   public oldPassword: string;

   @Field()
   @IsString()
   @IsNotEmpty({ message: 'Пароль не может быть пустым' })
   @MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
   public newPassword: string;
}
