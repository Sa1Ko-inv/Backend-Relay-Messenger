import {
   BadRequestException,
   ConflictException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import {
   ConversationRole,
   ConversationType,
   ConversationVisibility,
   Prisma,
   type User,
} from '@prisma/client';
import Upload from 'graphql-upload/Upload.mjs';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { CreateGroupInput } from '@/src/modules/conversation/inputs/create-group.input';
import { CreatePersonalConversationInput } from '@/src/modules/conversation/inputs/create-personal-conversation.input';
import { StorageService } from '@/src/modules/libs/storage/storage.service';
import { generateInviteCode } from '@/src/shared/utils/generate-invite-code.utils';

const sharp: any = require('sharp');

@Injectable()
export class ConversationService {
   private readonly conversationInclude = {
      settings: true,
      members: {
         include: {
            user: true,
         },
      },
   } satisfies Prisma.ConversationInclude;

   public constructor(
      private readonly prismaService: PrismaService,
      private readonly storageService: StorageService
   ) {}

   public async createPersonalConversation(
      currentUserId: string,
      input: CreatePersonalConversationInput
   ) {
      const { userId: targetUserId } = input;

      if (currentUserId === targetUserId) {
         throw new BadRequestException('Нельзя создать персональный чат с самим собой');
      }

      const targetUser = await this.prismaService.user.findUnique({
         where: { id: targetUserId },
      });

      if (!targetUser) {
         throw new NotFoundException('Пользователь не найден');
      }

      const existingConversation = await this.findPersonalConversation(
         currentUserId,
         targetUserId
      );

      if (existingConversation) return existingConversation;

      const conversation = await this.prismaService.conversation.create({
         data: {
            type: ConversationType.PERSONAL,
            visibility: ConversationVisibility.PRIVATE,
            settings: { create: {} },
            members: {
               create: [
                  { userId: currentUserId, role: ConversationRole.MEMBER },
                  { userId: targetUserId, role: ConversationRole.MEMBER },
               ],
            },
         },
         include: this.conversationInclude,
      });
      return conversation;
   }

   public async getFavoritesConversation(userId: string) {
      const favoritesConversation = await this.prismaService.conversation.findFirst({
         where: {
            type: ConversationType.FAVORITES,
            ownerId: userId,
         },
         include: this.conversationInclude,
      });

      return favoritesConversation;
   }

   public async createGroupConversation(input: CreateGroupInput, user: User, file?: Upload) {
      const { title, description } = input;

      const avatarUrl = file ? await this.uploadGroupAvatar(file, user.username) : null;

      const groupConversation = await this.prismaService.conversation.create({
         data: {
            type: ConversationType.GROUP,
            title,
            description,
            avatar: avatarUrl,
            visibility: ConversationVisibility.PRIVATE,
            ownerId: user.id,
            settings: { create: {} },
            members: {
               create: [
                  {
                     userId: user.id,
                     role: ConversationRole.OWNER,
                     canPost: true,
                     canInvite: true,
                     canEditInfo: true,
                     canDeleteMessages: true,
                     canPinMessages: true,
                     canManageMembers: true,
                     canManageAdmins: true,
                     canManageSettings: true,
                  },
               ],
            },
            invites: {
               create: {
                  code: generateInviteCode(),
                  createdById: user.id,
               },
            },
         },
         include: this.conversationInclude,
      });

      return groupConversation;
   }

   private async uploadGroupAvatar(file: Upload, username: string): Promise<string> {
      const chunks: Buffer[] = [];

      for await (const chunk of file.createReadStream()) {
         chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      const fileName = `/group/${username}.webp`;

      if (file.filename && file.filename.endsWith('.gif')) {
         const processedBuffer = await sharp(buffer, { animated: true })
            .resize(512, 512)
            .webp()
            .toBuffer();

         await this.storageService.upload(processedBuffer, fileName, 'image/webp');
      } else {
         const processedBuffer = await sharp(buffer).resize(512, 512).webp().toBuffer();

         await this.storageService.upload(processedBuffer, fileName, 'image/webp');
      }

      return fileName;
   }

   private async findPersonalConversation(currentUserId: string, targetUserId: string) {
      const conversation = await this.prismaService.conversation.findFirst({
         where: {
            type: ConversationType.PERSONAL,
            AND: [
               {
                  members: {
                     some: {
                        userId: currentUserId,
                     },
                  },
               },
               {
                  members: {
                     some: {
                        userId: targetUserId,
                     },
                  },
               },
            ],
         },
         include: this.conversationInclude,
      });
      // PERSONAL-диалог всегда содержит ровно двух участников.
      // Если найден разговор с другим количеством участников,
      // считаем его некорректным и игнорируем.
      if (conversation && conversation.members.length === 2) {
         return conversation;
      }

      return null;
   }
}
