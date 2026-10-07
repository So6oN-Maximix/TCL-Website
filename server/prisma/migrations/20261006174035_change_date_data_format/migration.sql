/*
  Warnings:

  - You are about to drop the column `date` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `heureDebut` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Indisponibilite` table. All the data in the column will be lost.
  - You are about to drop the column `heureDebut` on the `Indisponibilite` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[courtId,dateDebut]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dateDebut` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateDebut` to the `Indisponibilite` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Booking_courtId_date_heureDebut_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "date",
DROP COLUMN "heureDebut",
ADD COLUMN     "dateDebut" DATE NOT NULL;

-- AlterTable
ALTER TABLE "Indisponibilite" DROP COLUMN "date",
DROP COLUMN "heureDebut",
ADD COLUMN     "dateDebut" DATE NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_courtId_dateDebut_key" ON "Booking"("courtId", "dateDebut");
