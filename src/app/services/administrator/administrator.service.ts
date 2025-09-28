import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/User.model';
import { Observable } from 'rxjs';
import { BaseResponse } from '../../models/BaseResponse.model';
import { Listing } from '../../pages/profile/my-listings/my-listings.component';

@Injectable({
  providedIn: 'root'
})
export class AdministratorService {
  BASE_URL = `${environment.apiUrl}/admin`
 private constructor(private http:HttpClient){}



 getAllUsers(): Observable<BaseResponse<User[]>>{
  return this.http.get<BaseResponse<User[]>>(`${this.BASE_URL}/get-all-users`,{withCredentials:true});
 }

  getAllListings(): Observable<BaseResponse<Listing[]>>{
  return this.http.get<BaseResponse<Listing[]>>(`${this.BASE_URL}/get-all-listings`,{withCredentials:true});
 }
}
