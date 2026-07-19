/*
  Warnings:

  - A unique constraint covering the columns `[username_lower]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "conversations_username_key";

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "username_lower" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "conversations_username_lower_key" ON "conversations"("username_lower");
