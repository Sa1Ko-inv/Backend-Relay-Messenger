import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
   ConversationRole,
   ConversationType,
   ConversationVisibility,
   Prisma,
} from '@prisma/client';

import { PrismaService } from '@/src/core/prisma/prisma.service';
import { CreatePersonalConversationInput } from '@/src/modules/conversation/inputs/create-personal-conversation.input';

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

   public constructor(private readonly prismaService: PrismaService) {}

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
      return await this.prismaService.conversation.findFirst({
         where: {
            type: ConversationType.FAVORITES,
            ownerId: userId,
         },
         include: this.conversationInclude,
      });
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
