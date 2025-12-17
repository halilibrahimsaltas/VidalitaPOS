-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('UZS', 'USD', 'TRY', 'EUR');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'UZS';
