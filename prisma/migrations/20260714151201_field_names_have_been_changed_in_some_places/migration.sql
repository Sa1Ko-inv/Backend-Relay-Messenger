/*
  Warnings:

  - Added the required column `position` to the `conversation_pinned_messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "conversation_pinned_messages" ADD COLUMN     "position" INTEGER NOT NULL;
