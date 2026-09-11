/*
  Warnings:

  - The `type` column on the `Court` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CourtType" AS ENUM ('INTERIEUR', 'EXTERIEUR');

-- AlterTable
ALTER TABLE "Court" DROP COLUMN "type",
ADD COLUMN     "type" "CourtType" NOT NULL DEFAULT 'INTERIEUR';
