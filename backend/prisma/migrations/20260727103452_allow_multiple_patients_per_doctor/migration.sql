-- CreateEnum
CREATE TYPE "MeasurementType" AS ENUM ('TEMPERATURE', 'HEART_RATE', 'BLOOD_PRESSURE', 'WEIGHT', 'HEIGHT', 'OXYGEN_SATURATION', 'BLOOD_GLUCOSE');

-- DropIndex
DROP INDEX "Patient_doctorId_key";

-- CreateTable
CREATE TABLE "BiometricMeasure" (
    "id" SERIAL NOT NULL,
    "type" "MeasurementType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "takenById" INTEGER,
    "medicalRecordId" INTEGER NOT NULL,
    "consultationId" INTEGER,

    CONSTRAINT "BiometricMeasure_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BiometricMeasure" ADD CONSTRAINT "BiometricMeasure_takenById_fkey" FOREIGN KEY ("takenById") REFERENCES "NurseAssistant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiometricMeasure" ADD CONSTRAINT "BiometricMeasure_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiometricMeasure" ADD CONSTRAINT "BiometricMeasure_consultationId_fkey" FOREIGN KEY ("consultationId") REFERENCES "Consultation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
