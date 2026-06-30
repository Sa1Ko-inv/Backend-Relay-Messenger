/*
  Warnings:

  - The values [DEACTIVATE] on the enum `token_types` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "token_types_new" AS ENUM ('PASSWORD_RESET', 'EMAIL_VERIFICATION', 'DEACTIVATE_ACCOUNT');
ALTER TABLE "tokens" ALTER COLUMN "type" TYPE "token_types_new" USING ("type"::text::"token_types_new");
ALTER TYPE "token_types" RENAME TO "token_types_old";
ALTER TYPE "token_types_new" RENAME TO "token_types";
DROP TYPE "public"."token_types_old";
COMMIT;
