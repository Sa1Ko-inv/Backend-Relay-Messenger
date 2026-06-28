import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

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

   @Field(() => String, { nullable: true })
   @IsString()
   @IsOptional()
   // @IsNotEmpty({ message: 'Пин не может быть пустым' })
   @MinLength(6, { message: 'Пин должен быть не менее 6 символов' })
   public pin?: string;
}
