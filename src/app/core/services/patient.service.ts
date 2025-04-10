
// src/app/core/services/patient.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  // private apiUrl = `${environment.apiUrl}/patients`;

  // constructor(private http: HttpClient) {}

  // getPatients(): Observable<Patient[]> {
  //   return this.http.get<Patient[]>(this.apiUrl);
  // }

  // getPatientById(id: string): Observable<Patient> {
  //   return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  // }

  // createPatient(patient: Patient): Observable<Patient> {
  //   return this.http.post<Patient>(this.apiUrl, patient);
  // }

  // updatePatient(id: string, patient: Patient): Observable<Patient> {
  //   return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient);
  // }

  // deletePatient(id: string): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/${id}`);
  // }
}