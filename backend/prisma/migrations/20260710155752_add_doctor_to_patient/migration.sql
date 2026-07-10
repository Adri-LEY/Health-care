/*
  Warnings:

  - A unique constraint covering the columns `[doctorId]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "doctorId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_doctorId_key" ON "Patient"("doctorId");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
