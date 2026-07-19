import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
   Conversation,
   ConversationInvite,
   ConversationMember,
   ConversationRole,
   ConversationSettings,
   ConversationType,
   ConversationVisibility,
} from '@prisma/client';

import { UserModel } from '@/src/modules/auth/account/models/user.model';

registerEnumType(ConversationRole, {
   name: 'ConversationRole',
});

registerEnumType(ConversationType, {
   name: 'ConversationType',
});

registerEnumType(ConversationVisibility, {
   name: 'ConversationVisibility',
});

@ObjectType()
export class ConversationSettingModel implements ConversationSettings {
   @Field(() => ID)
   public id: string;

   @Field(() => Boolean)
   public allowMedia: boolean;

   @Field(() => Boolean)
   public allowVoice: boolean;

   @Field(() => Boolean)
   public allowReactions: boolean;

   @Field(() => Boolean)
   public allowForward: boolean;

   @Field(() => Boolean)
   public allowScreenshot: boolean;

   @Field(() => Boolean)
   public historyVisible: boolean;

   @Field(() => Number)
   public slowModeSeconds: number;

   @Field(() => Boolean)
   public joinRequestsEnabled: boolean;

   @Field(() => String)
   public conversationId: string;

   @Field(() => Date)
   public createdAt: Date;

   @Field(() => Date)
   public updatedAt: Date;
}

@ObjectType()
export class ConversationMemberModel implements ConversationMember {
   @Field(() => ID)
   public id: string;

   @Field(() => ConversationRole)
   public role: ConversationRole;

   @Field(() => Boolean)
   public canPost: boolean;

   @Field(() => Boolean)
   public canInvite: boolean;

   @Field(() => Boolean)
   public canEditInfo: boolean;

   @Field(() => Boolean)
   public canDeleteMessages: boolean;

   @Field(() => Boolean)
   public canPinMessages: boolean;

   @Field(() => Boolean)
   public canManageMembers: boolean;

   @Field(() => Boolean)
   public canManageAdmins: boolean;

   @Field(() => Boolean)
   public canManageSettings: boolean;

   @Field(() => Boolean)
   public isMuted: boolean;

   @Field(() => Boolean)
   public isPinned: boolean;

   @Field(() => Date)
   public joinedAt: Date;

   @Field(() => Date)
   public createdAt: Date;

   @Field(() => Date)
   public updatedAt: Date;

   @Field(() => String)
   public conversationId: string;

   @Field(() => String)
   public userId: string;

   @Field(() => UserModel)
   public user: UserModel;

   @Field(() => String, { nullable: true })
   public lastReadMessageId: string;
}

@ObjectType()
export class ConversationInviteModel implements ConversationInvite {
   @Field(() => ID)
   public id: string;

   @Field(() => String)
   public code: string;

   @Field(() => Number, { nullable: true })
   public maxUses: number;

   @Field(() => Number)
   public uses: number;

   @Field(() => Boolean)
   public isRevoked: boolean;

   @Field(() => Date, { nullable: true })
   public expiresAt: Date;

   @Field(() => Date)
   public createdAt: Date;

   @Field(() => Date)
   public updatedAt: Date;

   @Field(() => String)
   public conversationId: string;

   @Field(() => String)
   public createdById: string;

   @Field(() => UserModel)
   public createdBy: UserModel;
}

@ObjectType()
export class ConversationModel implements Conversation {
   @Field(() => ID)
   public id: string;

   @Field(() => ConversationType)
   public type: ConversationType;

   @Field(() => ConversationVisibility)
   public visibility: ConversationVisibility;

   @Field(() => String, { nullable: true })
   public title: string;

   @Field(() => String, { nullable: true })
   public username: string;

   @Field(() => String, { nullable: true })
   public usernameLower: string;

   @Field(() => String, { nullable: true })
   public description: string;

   @Field(() => String, { nullable: true })
   public avatar: string;

   @Field(() => Boolean)
   public isVerified: boolean;

   @Field(() => String, { nullable: true })
   public lastMessageId: string;

   @Field(() => String, { nullable: true })
   public ownerId: string;

   @Field(() => ConversationSettingModel, { nullable: true })
   public settings: ConversationSettingModel;

   @Field(() => [ConversationMemberModel])
   public members: ConversationMemberModel[];

   @Field(() => [ConversationInviteModel])
   public invites: ConversationInviteModel[];

   @Field(() => Date)
   public createdAt: Date;

   @Field(() => Date)
   public updatedAt: Date;
}
