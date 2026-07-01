import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class NewEmailInput {
   @Field(() => String)
   @IsString()
   @IsNotEmpty()
   @IsEmail()
   public email: string;

   @Field(() => String)
   @IsUUID('4')
   @IsNotEmpty()
   public token: string;
}
