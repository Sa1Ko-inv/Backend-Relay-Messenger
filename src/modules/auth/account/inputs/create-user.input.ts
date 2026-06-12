import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
   @Field()
   @IsString()
   @IsNotEmpty()
   public username: string;

   @Field()
   @IsString()
   @IsNotEmpty()
   @IsEmail()
   public email: string;

   @Field()
   @IsString()
   @IsNotEmpty()
   @MinLength(8)
   public password: string;
}
