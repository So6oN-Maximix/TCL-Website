/*
  Warnings:

  - You are about to drop the column `heureFin` on the `Booking` table. All the data in the column will be lost.
  - Changed the type of `heureDebut` on the `Booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "heureFin",
ALTER COLUMN "date" SET DATA TYPE DATE,
DROP COLUMN "heureDebut",
ADD COLUMN     "heureDebut" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Indisponibilite" (
    "id" SERIAL NOT NULL,
    "courtId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "heureDebut" INTEGER NOT NULL,
    "heureFin" INTEGER NOT NULL,
    "raison" TEXT,

    CONSTRAINT "Indisponibilite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_courtId_date_heureDebut_key" ON "Booking"("courtId", "date", "heureDebut");

-- AddForeignKey
ALTER TABLE "Indisponibilite" ADD CONSTRAINT "Indisponibilite_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
