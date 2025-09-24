import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/User.model';
import { BaseResponse } from '../../models/BaseResponse.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  baseURL = `${environment.apiUrl}/users`;

  constructor(private http:HttpClient) { }

  uploadProfileImage(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file); // 'file' must match your backend param name

    const req = new HttpRequest('POST', `${this.baseURL}/profile-pic-upload`, formData, {
      reportProgress: true,
      responseType: 'json',
      withCredentials:true
    });


    return this.http.request(req);
  }

    getUserById(id:string): Observable<BaseResponse<User>>{
    return this.http.get<BaseResponse<User>>(`${this.baseURL}/id/${id}`);
  }


}
