import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserModel {
   @Field(() => ID)
   public id: string;

   @Field(() => String)
   public email: string;
   @Field(() => String)
   public password: string;

   @Field(() => String)
   public username: string;
   @Field(() => String)
   public displayName: string;

   @Field(() => String, { nullable: true })
   public avatar: string;
   @Field(() => String, { nullable: true })
   public bio: string;

   @Field(() => Date)
   public lastSeenAt: Date;
   @Field(() => String)
   public publicKey: string;

   @Field(() => Boolean)
   public isVerified: boolean;

   @Field(() => Date)
   public createdAt: Date;
   @Field(() => Date)
   public updatedAt: Date;
}
