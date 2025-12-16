/*
  Warnings:

  - A unique constraint covering the columns `[wallet_token]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_name` to the `wallets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wallet_token` to the `wallets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "account_name" TEXT NOT NULL,
ADD COLUMN     "wallet_token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "wallets_wallet_token_key" ON "wallets"("wallet_token");
