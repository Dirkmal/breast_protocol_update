export interface Patient {
    id?: string;
    hospitalNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    contactNumber: string;
    insurance_provider?: string;
    insurance_number?: string;
    email?: string;
    address?: string;
    bloodGroup?: string;
    medicalHistory?: string;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}