import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SensorData } from '../models/sensorData.model';

const baseUrl = 'http://localhost:8080/api/table';

@Injectable({
  providedIn: 'root'
})
export class SensorService {

  constructor(private http: HttpClient) {}

  getAll(): Observable<SensorData[]> {
    return this.http.get<SensorData[]>(baseUrl);
  }

  get(id: any): Observable<SensorData> {
    return this.http.get(`${baseUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(baseUrl, data);
  }
}
