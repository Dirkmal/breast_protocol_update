export interface User {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: 'admin' | 'doctor' | 'nurse' | 'staff';
    department?: string;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  