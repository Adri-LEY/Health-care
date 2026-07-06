/*
  Warnings:

  - A unique constraint covering the columns `[medicalRecordId]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `medicalRecordId` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('O', 'A', 'B', 'AB');

-- CreateEnum
CREATE TYPE "Imc" AS ENUM ('UNDERWEIGHT', 'NORMAL_WEIGHT', 'OVERWEIGHT', 'OBESITY', 'CLASS_1_OBESITY', 'CLASS_2_OBESITY', 'CLASS_3_OBESITY');

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "medicalRecordId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userStatus" "UserStatus" DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" SERIAL NOT NULL,
    "poids" DOUBLE PRECISION,
    "taille" DOUBLE PRECISION,
    "bloodType" "BloodType",
    "imc" "Imc",
    "medical_history" TEXT,
    "family_history" TEXT,
    "allergies" TEXT,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_medicalRecordId_key" ON "Patient"("medicalRecordId");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
