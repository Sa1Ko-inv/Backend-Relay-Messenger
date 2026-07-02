import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

@InputType()
export class ChangeProfileInfoInput {
   @Field()
   @IsString({ message: 'Имя пользователя должно быть строкой' })
   @IsNotEmpty({ message: 'Имя пользователя не может быть пустым' })
   @Matches(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/, {
      message:
         'Имя пользователя не может содержать русские буквы и специальные символы, кроме дефиса',
   })
   public username: string;

   @Field()
   @IsString({ message: 'Отображаемое имя должно быть строкой' })
   @IsNotEmpty({ message: 'Отображаемое имя не может быть пустым' })
   public displayName: string;

   @Field()
   @IsString({ message: 'Отображаемое имя должно быть строкой' })
   @IsOptional()
   @MaxLength(300)
   public bio?: string;
}
