-- CreateEnum
CREATE TYPE "call_types" AS ENUM ('VOICE', 'VIDEO');

-- CreateEnum
CREATE TYPE "call_statuses" AS ENUM ('RINGING', 'ACTIVE', 'ENDED', 'MISSED', 'CANCELLED');

-- DropIndex
DROP INDEX "conversation_members_conversation_id_idx";

-- DropIndex
DROP INDEX "messages_conversation_id_idx";

-- CreateTable
CREATE TABLE "calls" (
    "id" TEXT NOT NULL,
    "type" "call_types" NOT NULL,
    "status" "call_statuses" NOT NULL,
    "title" TEXT,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "conversation_id" TEXT NOT NULL,
    "started_by_id" TEXT NOT NULL,
    "message_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_participants" (
    "id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3),
    "left_at" TIMESTAMP(3),
    "is_muted" BOOLEAN NOT NULL DEFAULT false,
    "is_camera_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_screen_sharing" BOOLEAN NOT NULL DEFAULT false,
    "call_id" TEXT NOT NULL,
    "is_connected" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "calls_message_id_key" ON "calls"("message_id");

-- CreateIndex
CREATE INDEX "calls_conversation_id_idx" ON "calls"("conversation_id");

-- CreateIndex
CREATE INDEX "calls_started_by_id_idx" ON "calls"("started_by_id");

-- CreateIndex
CREATE INDEX "calls_started_at_idx" ON "calls"("started_at");

-- CreateIndex
CREATE INDEX "call_participants_call_id_idx" ON "call_participants"("call_id");

-- CreateIndex
CREATE INDEX "call_participants_user_id_idx" ON "call_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "call_participants_call_id_user_id_key" ON "call_participants"("call_id", "user_id");

-- CreateIndex
CREATE INDEX "conversation_members_conversation_id_joined_at_idx" ON "conversation_members"("conversation_id", "joined_at");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_started_by_id_fkey" FOREIGN KEY ("started_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_participants" ADD CONSTRAINT "call_participants_call_id_fkey" FOREIGN KEY ("call_id") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_participants" ADD CONSTRAINT "call_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
