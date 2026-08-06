/*
  Warnings:

  - A unique constraint covering the columns `[nom]` on the table `Team` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Team_nom_key" ON "Team"("nom");
