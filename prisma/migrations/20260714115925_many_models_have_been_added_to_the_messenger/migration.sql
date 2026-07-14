-- CreateEnum
CREATE TYPE "conversation_types" AS ENUM ('PERSONAL', 'GROUP', 'CHANNEL', 'FAVORITES');

-- CreateEnum
CREATE TYPE "conversation_visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "conversation_roles" AS ENUM ('OWNER', 'ADMIN', 'MODERATOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "message_types" AS ENUM ('USER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "attachment_types" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'FILE');

-- CreateEnum
CREATE TYPE "attachment_purposes" AS ENUM ('MEDIA', 'FILE', 'VOICE_MESSAGE', 'VIDEO_MESSAGE', 'CUSTOM_STICKER');

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "type" "conversation_types" NOT NULL,
    "visibility" "conversation_visibility" NOT NULL,
    "title" TEXT NOT NULL,
    "username" TEXT,
    "description" TEXT,
    "avatar" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_message_id" TEXT,
    "owner_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_members" (
    "id" TEXT NOT NULL,
    "role" "conversation_roles" NOT NULL,
    "can_post" BOOLEAN NOT NULL DEFAULT false,
    "can_invite" BOOLEAN NOT NULL DEFAULT false,
    "can_edit_info" BOOLEAN NOT NULL DEFAULT false,
    "can_delete_messages" BOOLEAN NOT NULL DEFAULT false,
    "can_pin_messages" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_members" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_admins" BOOLEAN NOT NULL DEFAULT false,
    "can_manage_settings" BOOLEAN NOT NULL DEFAULT false,
    "is_muted" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_message_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "conversation_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_settings" (
    "id" TEXT NOT NULL,
    "allow_media" BOOLEAN NOT NULL DEFAULT true,
    "allow_voice" BOOLEAN NOT NULL DEFAULT true,
    "allow_reactions" BOOLEAN NOT NULL DEFAULT true,
    "allow_forward" BOOLEAN NOT NULL DEFAULT true,
    "allow_screenshot" BOOLEAN NOT NULL DEFAULT true,
    "history_visible" BOOLEAN NOT NULL DEFAULT true,
    "slow_mode_seconds" INTEGER NOT NULL DEFAULT 0,
    "join_requests_enabled" BOOLEAN NOT NULL DEFAULT false,
    "conversation_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_invites" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "max_uses" INTEGER,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3),
    "conversation_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_pinned_messages" (
    "id" TEXT NOT NULL,
    "pinned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message_id" TEXT NOT NULL,
    "pinned_by_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,

    CONSTRAINT "conversation_pinned_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "type" "message_types" NOT NULL,
    "content" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "edited_at" TIMESTAMP(3),
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "reply_to_message_id" TEXT,
    "forwarded_from_message_id" TEXT,
    "sticker_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "type" "attachment_types" NOT NULL,
    "purpose" "attachment_purposes" NOT NULL,
    "url" TEXT NOT NULL,
    "file_name" TEXT,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "is_spoiler" BOOLEAN NOT NULL DEFAULT false,
    "self_destruct_at" TIMESTAMP(3),
    "message_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "emoji_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reaction_emojis" (
    "id" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "animation_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reaction_emojis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sticker_packs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "username" TEXT,
    "description" TEXT,
    "is_official" BOOLEAN NOT NULL DEFAULT false,
    "author_id" TEXT,
    "cover_sticker_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sticker_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stickers" (
    "id" TEXT NOT NULL,
    "emoji" TEXT,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "pack_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stickers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sticker_packs" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "installed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "pack_id" TEXT NOT NULL,

    CONSTRAINT "user_sticker_packs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversations_username_key" ON "conversations"("username");

-- CreateIndex
CREATE INDEX "conversations_owner_id_idx" ON "conversations"("owner_id");

-- CreateIndex
CREATE INDEX "conversations_created_at_idx" ON "conversations"("created_at");

-- CreateIndex
CREATE INDEX "conversation_members_conversation_id_idx" ON "conversation_members"("conversation_id");

-- CreateIndex
CREATE INDEX "conversation_members_user_id_idx" ON "conversation_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_members_conversation_id_user_id_key" ON "conversation_members"("conversation_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_settings_conversation_id_key" ON "conversation_settings"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_invites_code_key" ON "conversation_invites"("code");

-- CreateIndex
CREATE INDEX "conversation_invites_conversation_id_idx" ON "conversation_invites"("conversation_id");

-- CreateIndex
CREATE INDEX "conversation_invites_created_by_id_idx" ON "conversation_invites"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_pinned_messages_message_id_key" ON "conversation_pinned_messages"("message_id");

-- CreateIndex
CREATE INDEX "conversation_pinned_messages_conversation_id_idx" ON "conversation_pinned_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "conversation_pinned_messages_message_id_idx" ON "conversation_pinned_messages"("message_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX "attachments_message_id_idx" ON "attachments"("message_id");

-- CreateIndex
CREATE INDEX "reactions_message_id_idx" ON "reactions"("message_id");

-- CreateIndex
CREATE INDEX "reactions_user_id_idx" ON "reactions"("user_id");

-- CreateIndex
CREATE INDEX "reactions_emoji_id_idx" ON "reactions"("emoji_id");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_message_id_user_id_key" ON "reactions"("message_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "reaction_emojis_emoji_is_premium_key" ON "reaction_emojis"("emoji", "is_premium");

-- CreateIndex
CREATE UNIQUE INDEX "sticker_packs_username_key" ON "sticker_packs"("username");

-- CreateIndex
CREATE UNIQUE INDEX "sticker_packs_cover_sticker_id_key" ON "sticker_packs"("cover_sticker_id");

-- CreateIndex
CREATE INDEX "sticker_packs_author_id_idx" ON "sticker_packs"("author_id");

-- CreateIndex
CREATE INDEX "stickers_pack_id_idx" ON "stickers"("pack_id");

-- CreateIndex
CREATE UNIQUE INDEX "stickers_pack_id_position_key" ON "stickers"("pack_id", "position");

-- CreateIndex
CREATE INDEX "user_sticker_packs_user_id_idx" ON "user_sticker_packs"("user_id");

-- CreateIndex
CREATE INDEX "user_sticker_packs_pack_id_idx" ON "user_sticker_packs"("pack_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_sticker_packs_user_id_pack_id_key" ON "user_sticker_packs"("user_id", "pack_id");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_last_message_id_fkey" FOREIGN KEY ("last_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_members" ADD CONSTRAINT "conversation_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_settings" ADD CONSTRAINT "conversation_settings_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_invites" ADD CONSTRAINT "conversation_invites_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_invites" ADD CONSTRAINT "conversation_invites_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_pinned_messages" ADD CONSTRAINT "conversation_pinned_messages_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_pinned_messages" ADD CONSTRAINT "conversation_pinned_messages_pinned_by_id_fkey" FOREIGN KEY ("pinned_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_pinned_messages" ADD CONSTRAINT "conversation_pinned_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_message_id_fkey" FOREIGN KEY ("reply_to_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_forwarded_from_message_id_fkey" FOREIGN KEY ("forwarded_from_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sticker_id_fkey" FOREIGN KEY ("sticker_id") REFERENCES "stickers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_emoji_id_fkey" FOREIGN KEY ("emoji_id") REFERENCES "reaction_emojis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sticker_packs" ADD CONSTRAINT "sticker_packs_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sticker_packs" ADD CONSTRAINT "sticker_packs_cover_sticker_id_fkey" FOREIGN KEY ("cover_sticker_id") REFERENCES "stickers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stickers" ADD CONSTRAINT "stickers_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "sticker_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sticker_packs" ADD CONSTRAINT "user_sticker_packs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sticker_packs" ADD CONSTRAINT "user_sticker_packs_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "sticker_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
