import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
   @Field()
   @IsString({ message: 'Логин должно быть строкой' })
   @IsNotEmpty({ message: 'Логин не может быть пустым' })
   public login: string;

   @Field()
   @IsString()
   @IsNotEmpty({ message: 'Пароль не может быть пустым' })
   @MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
   public password: string;
}
