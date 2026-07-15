// patient-record-owner.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PatientsRepository } from 'src/patients/patients.repository';

@Injectable()
export class PatientRecordOwnerGuard implements CanActivate {

    constructor(private readonly patientsRepository: PatientsRepository) {
        // Vous pouvez injecter un repository ou un service si nécessaire pour vérifier la propriété du dossier médical
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user; // Injecté au préalable par votre JwtAuthGuard

        const patientIdFromParams = parseInt(request.params.patientId, 10);

        if (isNaN(patientIdFromParams)) {
            return true;
        }

        console.log('PatientRecordOwnerGuard - user:', user);

        if (user && user.role === 'PATIENT') {
            const loggedInPatientId = user.patientId; // Récupère l'ID du patient connecté depuis le token JWT

            if (loggedInPatientId !== patientIdFromParams) {
                throw new ForbiddenException(
                    "Accès refusé : Vous ne pouvez consulter que votre propre dossier médical."
                );
            }
        }

        // 3. Si c'est un DOCTOR, NURSE_ASSISTANT ou que l'ID correspond, on autorise l'accès (true)
        return true;
    }
}