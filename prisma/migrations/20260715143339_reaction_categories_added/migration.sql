-- CreateEnum
CREATE TYPE "reaction_categories" AS ENUM ('DEFAULT', 'PREMIUM', 'CUSTOM');

-- AlterTable
ALTER TABLE "reaction_emojis" ADD COLUMN     "category" "reaction_categories" NOT NULL DEFAULT 'DEFAULT',
ADD COLUMN     "name" TEXT;
