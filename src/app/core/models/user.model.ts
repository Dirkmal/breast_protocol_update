export interface Profile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;      
  institution?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
  