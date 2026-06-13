import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
   @Field()
   @IsString({ message: 'Имя пользователя должно быть строкой' })
   @IsNotEmpty({ message: 'Имя пользователя не может быть пустым' })
   @Matches(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/, {
      message:
         'Имя пользователя не может содержать русские буквы и специальные символы, кроме дефиса',
   })
   public username: string;

   @Field()
   @IsString({ message: 'Почта должна быть строкой' })
   @IsNotEmpty({ message: 'Почта не может быть пустым' })
   @IsEmail({}, { message: 'Некорректный формат почты' })
   public email: string;

   @Field()
   @IsString()
   @IsNotEmpty({ message: 'Пароль не может быть пустым' })
   @MinLength(8, { message: 'Пароль должен быть не менее 8 символов' })
   public password: string;
}
