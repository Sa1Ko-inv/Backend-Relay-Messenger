import {
   BadRequestException,
   ConflictException,
   ForbiddenException,
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
import { FindConversationUsernameInput } from '@/src/modules/conversation/inputs/find-conversation-username.input';
import { StorageService } from '@/src/modules/libs/storage/storage.service';
import { generateInviteCode } from '@/src/shared/utils/generate-invite-code.utils';

import { ChangeConversationUsernameInput } from './inputs/change-conversation-username.input';
import { CreateChannelInput } from './inputs/create-channel.input';
import { FindConversationInput } from './inputs/find-conversation.input';
import { MakeGroupPublicInput } from './inputs/make-group-public.input';
import { UpdateConversationInput } from './inputs/update-conversation.input';
import { WorkAvatarInput } from './inputs/work-avatar.input';

const sharp: any = require('sharp');

@Injectable()
export class ConversationService {
   private readonly conversationInclude = {
      settings: true,

      members: {
         include: {
            user: {
               select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
                  bio: true,
                  isVerified: true,
                  lastSeenAt: true,
               },
            },
         },
      },

      invites: {
         include: {
            createdBy: {
               select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatar: true,
               },
            },
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

      const avatarUrl = file ? await this.uploadConversationAvatar(file, user.username) : null;

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

   public async makeGroupPublic(user: User, input: MakeGroupPublicInput) {
      const { username, conversationId } = input;

      await this.getOwnerConversation(conversationId, user.id);

      const conversation = await this.getConversationOrThrow(conversationId);

      if (conversation.type !== ConversationType.GROUP) {
         throw new BadRequestException('Это не группа');
      }

      if (conversation.visibility === ConversationVisibility.PUBLIC) {
         throw new BadRequestException('Группа уже публичная');
      }

      let usernameLower: string | null = null;

      if (username) {
         usernameLower = await this.ensureUsernameAvailable(username, conversationId);
      }

      return await this.prismaService.conversation.update({
         where: { id: conversationId },
         data: {
            visibility: ConversationVisibility.PUBLIC,
            username,
            usernameLower,
         },
         include: this.conversationInclude,
      });
   }

   public async changeConversationUsername(
      user: User,
      input: ChangeConversationUsernameInput
   ) {
      const { username, conversationId } = input;

      await this.getOwnerConversation(conversationId, user.id);

      const conversation = await this.getConversationOrThrow(conversationId);

      if (conversation.type !== ConversationType.GROUP) {
         throw new BadRequestException('Это не группа');
      }

      if (conversation.visibility === ConversationVisibility.PRIVATE) {
         throw new BadRequestException(
            'У группы нет публичного имени пользователя. Сначала сделайте группу публичной, а затем измените имя пользователя'
         );
      }

      const usernameLower = await this.ensureUsernameAvailable(username, conversationId);

      const changeConversationUsername = await this.prismaService.conversation.update({
         where: { id: conversationId },
         data: {
            username,
            usernameLower,
         },
         include: this.conversationInclude,
      });
      return changeConversationUsername;
   }

   public async createChannelConversation(
      input: CreateChannelInput,
      user: User,
      file?: Upload
   ) {
      const { visibility, title, description, username } = input;

      if (visibility === ConversationVisibility.PRIVATE && username) {
         throw new BadRequestException('Частный канал не может иметь публичный username');
      }

      const usernameLower = username ? await this.ensureUsernameAvailable(username) : null;

      const avatarUrl = file ? await this.uploadConversationAvatar(file, user.username) : null;

      const channelConversation = await this.prismaService.conversation.create({
         data: {
            type: ConversationType.CHANNEL,
            title,
            description,
            avatar: avatarUrl,
            visibility,
            username,
            usernameLower,
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

      return channelConversation;
   }

   public async updateConversation(user: User, input: UpdateConversationInput) {
      const { conversationId, title, description } = input;

      const conversation = await this.getConversationOrThrow(conversationId);

      if (conversation.type === ConversationType.PERSONAL) {
         throw new BadRequestException('Нельзя изменить информацию у персонального диалога');
      }

      if (conversation.type === ConversationType.FAVORITES) {
         throw new BadRequestException('Нельзя изменить информацию у избранного');
      }

      await this.ensureCanEditConversation(conversationId, user.id);

      if (title === undefined && description === undefined) {
         throw new BadRequestException('Не переданы поля для изменения');
      }

      const updatedConversation = await this.prismaService.conversation.update({
         where: { id: conversationId },
         data: {
            title,
            description,
         },
         include: this.conversationInclude,
      });

      return updatedConversation;
   }

   public async changeConversationAvatar(user: User, input: WorkAvatarInput, file: Upload) {
      const { conversationId } = input;

      const conversation = await this.getConversationOrThrow(conversationId);

      await this.ensureCanEditConversation(conversationId, user.id);

      if (conversation.type === ConversationType.PERSONAL) {
         throw new BadRequestException('Нельзя изменить аватар у персонального диалога');
      }

      if (conversation.type === ConversationType.FAVORITES) {
         throw new BadRequestException('Нельзя изменить аватар у избранного');
      }

      if (conversation.avatar) {
         await this.storageService.remove(conversation.avatar);
      }

      const avatarUrl = await this.uploadConversationAvatar(file, conversation.id);

      const updatedConversation = await this.prismaService.conversation.update({
         where: { id: conversationId },
         data: {
            avatar: avatarUrl,
         },
         include: this.conversationInclude,
      });

      return updatedConversation;
   }

   public async removeConversationAvatar(user: User, input: WorkAvatarInput) {
      const { conversationId } = input;

      await this.ensureCanEditConversation(conversationId, user.id);

      const conversation = await this.getConversationOrThrow(conversationId);

      if (conversation.type === ConversationType.PERSONAL) {
         throw new BadRequestException('Нельзя удалить аватар у персонального диалога');
      }

      if (conversation.type === ConversationType.FAVORITES) {
         throw new BadRequestException('Нельзя удалить аватар у избранного');
      }

      if (!conversation.avatar) {
         throw new BadRequestException('У диалога нет аватара');
      }

      await this.storageService.remove(conversation.avatar);

      const updatedConversation = await this.prismaService.conversation.update({
         where: { id: conversationId },
         data: {
            avatar: null,
         },
         include: this.conversationInclude,
      });

      return updatedConversation;
   }

   public async findById(input: FindConversationInput, user: User) {
      const { conversationId } = input;

      const conversation = await this.prismaService.conversation.findUnique({
         where: { id: conversationId },
         include: this.conversationInclude,
      });

      if (!conversation) {
         throw new NotFoundException('Диалог не найден');
      }

      const isPublicGroupOrChannel =
         conversation.visibility === ConversationVisibility.PUBLIC &&
         (conversation.type === ConversationType.GROUP ||
            conversation.type === ConversationType.CHANNEL);

      if (isPublicGroupOrChannel) {
         return conversation;
      }

      const isMember = conversation.members.some(member => member.userId === user.id);

      if (!isMember) {
         throw new NotFoundException('Диалог не найден');
      }

      return conversation;
   }

   public async findByUsername(input: FindConversationUsernameInput) {
      const { username } = input;

      const usernameLower = username.trim().toLowerCase();

      const conversation = await this.prismaService.conversation.findUnique({
         where: { usernameLower },
         include: this.conversationInclude,
      });

      if (!conversation) {
         throw new NotFoundException('Диалог не найден');
      }

      const isPublicGroupOrChannel =
         conversation.visibility === ConversationVisibility.PUBLIC &&
         (conversation.type === ConversationType.GROUP ||
            conversation.type === ConversationType.CHANNEL);

      if (!isPublicGroupOrChannel) {
         throw new NotFoundException('Диалог не найден');
      }

      return conversation;
   }

   private async uploadConversationAvatar(
      file: Upload,
      conversationId: string
   ): Promise<string> {
      const chunks: Buffer[] = [];

      for await (const chunk of file.createReadStream()) {
         chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      const fileName = `/conversation/${conversationId}-${Date.now()}.webp`;

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

   // На данный момент метод используется для проверки существования диалога и получения его данных.
   private async getConversationOrThrow(conversationId: string) {
      const conversation = await this.prismaService.conversation.findUnique({
         where: { id: conversationId },
      });

      if (!conversation) {
         throw new NotFoundException('Диалог не найден');
      }

      return conversation;
   }

   // Проверяет, является ли пользователь владельцем диалога. Если нет, выбрасывает исключение ForbiddenException.
   private async getOwnerConversation(conversationId: string, userId: string) {
      const owner = await this.prismaService.conversationMember.findFirst({
         where: {
            userId,
            conversationId,
            role: ConversationRole.OWNER,
         },
      });

      if (!owner) {
         throw new ForbiddenException('Недостаточно прав');
      }

      return owner;
   }

   // Проверяет, занят ли username.
   private async ensureUsernameAvailable(
      username: string,
      conversationId?: string
   ): Promise<string> {
      const usernameLower = username.trim().toLowerCase();

      const existingConversation = await this.prismaService.conversation.findUnique({
         where: {
            usernameLower,
         },
      });

      if (existingConversation && existingConversation.id !== conversationId) {
         throw new ConflictException('Username уже занят');
      }

      return usernameLower;
   }

   // Проверяет, может ли пользователь редактировать диалог. Если нет, выбрасывает исключение ForbiddenException.
   private async ensureCanEditConversation(conversationId: string, userId: string) {
      const member = await this.prismaService.conversationMember.findFirst({
         where: {
            conversationId,
            userId,
            OR: [
               {
                  role: ConversationRole.OWNER,
               },
               {
                  role: ConversationRole.ADMIN,
                  canEditInfo: true,
               },
            ],
         },
      });

      if (!member) {
         throw new ForbiddenException('Недостаточно прав для редактирования диалога');
      }

      return member;
   }
}
