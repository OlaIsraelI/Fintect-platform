-- AlterTable
ALTER TABLE "users" ADD COLUMN "verificationToken" TEXT;
ALTER TABLE "users" ADD COLUMN "verificationTokenExpires" DATETIME;
