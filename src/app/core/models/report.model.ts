export interface Report {
    id?: string;
    patientId: string;
    reportType: 'lab' | 'radiology' | 'consultation' | 'procedure';
    reportTitle: string;
    reportDate: Date;
    symptoms?: string;
    diagnosis?: string;
    treatment?: string;
    medication?: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }[];
    labResults?: {
      testName: string;
      result: string;
      normalRange: string;
      unit: string;
    }[];
    radiologyFindings?: string;
    conclusion: string;
    recommendations?: string;
    doctorId: string;
    createdAt?: Date;
    updatedAt?: Date;
}